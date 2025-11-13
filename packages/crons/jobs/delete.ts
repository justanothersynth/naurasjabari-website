import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config, logger } from '../config'
import pkg from 'pg'
import { format } from 'date-fns'

const { Pool } = pkg

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

/**
 * Deletes azimuth data older than 1 hour (UTC) from the sun_moon table
 * and geostorm data older than 1 month (UTC) from the geostorm table
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  const jobLogger = logger.withContext({ job: 'delete' })
  jobLogger.info('Job started: Deleting old azimuth and geostorm data')

  // Create Postgres connection pool
  const pool = new Pool({
    connectionString: config.supabase.databaseUrl
  })

  try {
    // Calculate cutoff dates
    const oneHourAgo = new Date()
    oneHourAgo.setUTCHours(oneHourAgo.getUTCHours() - 1)
    const azimuthCutoffDate = oneHourAgo.toISOString()

    const oneMonthAgo = new Date()
    oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1)
    const geostormCutoffDate = oneMonthAgo.toISOString()

    const BATCH_SIZE = 25000
    
    // Delete azimuth data older than 1 hour (in batches of 25,000)
    let totalAzimuthDeleted = 0
    
    while (true) {
      const result = await pool.query(
        `DELETE FROM sun_moon 
         WHERE id IN (
           SELECT id FROM sun_moon
           WHERE created_at < $1
           ORDER BY created_at
           LIMIT $2
         )`,
        [azimuthCutoffDate, BATCH_SIZE]
      )

      const deletedInBatch = result.rowCount || 0
      totalAzimuthDeleted += deletedInBatch

      if (deletedInBatch > 0) {
        jobLogger.info('Deleted azimuth records batch', {
          batchDeleted: deletedInBatch,
          totalDeleted: totalAzimuthDeleted
        })
      }

      // Stop if we deleted fewer records than the batch size (no more records to delete)
      if (deletedInBatch < BATCH_SIZE) {
        break
      }
    }

    // Run VACUUM FULL and ANALYZE on sun_moon table
    if (totalAzimuthDeleted > 0) {
      await pool.query('VACUUM FULL sun_moon')
      await pool.query('ANALYZE sun_moon')
    }

    // Delete geostorm data older than 1 month (in batches of 25,000)
    let totalGeostormDeleted = 0
    
    while (true) {
      const result = await pool.query(
        `DELETE FROM geostorm 
         WHERE id IN (
           SELECT id FROM geostorm 
           WHERE created_at < $1 
           ORDER BY created_at
           LIMIT $2
         )`,
        [geostormCutoffDate, BATCH_SIZE]
      )

      const deletedInBatch = result.rowCount || 0
      totalGeostormDeleted += deletedInBatch

      if (deletedInBatch > 0) {
        jobLogger.info('Deleted geostorm records batch', {
          batchDeleted: deletedInBatch,
          totalDeleted: totalGeostormDeleted
        })
      }

      // Stop if we deleted fewer records than the batch size (no more records to delete)
      if (deletedInBatch < BATCH_SIZE) {
        break
      }
    }

    // Run VACUUM FULL and ANALYZE on geostorm table
    if (totalGeostormDeleted > 0) {
      await pool.query('VACUUM FULL geostorm')
      await pool.query('ANALYZE geostorm')
    }

    jobLogger.info('Deletion job completed successfully', {
      azimuthCutoff: format(new Date(azimuthCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss'),
      azimuthDeleted: totalAzimuthDeleted,
      geostormCutoff: format(new Date(geostormCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss'),
      geostormDeleted: totalGeostormDeleted
    })

  } catch (error) {
    jobLogger.error('Error in delete job', {
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    // Always close the pool connection and reset flag
    try {
      await pool.end()
    } catch (error) {
      jobLogger.error('Error closing pool', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'delete',
  description: 'Deletes azimuth data older than 1 hour and geostorm data older than 1 month',
  optionsSchema: OptionsSchema,
  async run() {
    if (config.nodeEnv === 'development') {
      await runJob()
      cron.schedule('0 0 * * *', () => runJob())
    } else {
      await runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
