import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import pkg from 'pg'
import { format } from 'date-fns'

const { Pool } = pkg

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

/**
 * Deletes azimuth data older than 10 seconds (UTC) from the sun_moon table
 * and geostorm data older than 1 month (UTC) from the geostorm table
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: delete',
      'Deleting azimuth data older than 10 seconds and geostorm data older than 1 month',
      'info'
    )
  )

  // Create Postgres connection pool
  const pool = new Pool({
    connectionString: config.supabase.databaseUrl
  })

  try {
    // Calculate cutoff dates
    const tenSecondsAgo = new Date()
    tenSecondsAgo.setUTCSeconds(tenSecondsAgo.getUTCSeconds() - 10)
    const azimuthCutoffDate = tenSecondsAgo.toISOString()

    const oneMonthAgo = new Date()
    oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1)
    const geostormCutoffDate = oneMonthAgo.toISOString()

    const BATCH_SIZE = 25000
    
    // Delete azimuth data older than 10 seconds (in batches of 25,000)
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
        /* eslint-disable-next-line no-console */
        console.log(Chalk.gray(`    Deleted ${deletedInBatch} azimuth records (total: ${totalAzimuthDeleted})`))
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
        /* eslint-disable-next-line no-console */
        console.log(Chalk.gray(`    Deleted ${deletedInBatch} geostorm records (total: ${totalGeostormDeleted})`))
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

    const azimuthDeleted = totalAzimuthDeleted
    const geostormDeleted = totalGeostormDeleted
    
    const summary = `${Chalk.bold('Azimuth')}\n` +
      `Cutoff: ${format(new Date(azimuthCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss')} UTC\n` +
      `Deleted: ${azimuthDeleted} record${azimuthDeleted === 1 ? '' : 's'}\n\n` +
      `${Chalk.bold('Geostorm')}\n` +
      `Cutoff: ${format(new Date(geostormCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss')} UTC\n` +
      `Deleted: ${geostormDeleted} record${geostormDeleted === 1 ? '' : 's'}`

    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Data Deletion Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in delete job:', error)
  } finally {
    // Always close the pool connection
    await pool.end()
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'delete',
  description: 'Deletes azimuth data older than 10 seconds and geostorm data older than 1 month',
  optionsSchema: OptionsSchema,
  async run() {
    if (config.nodeEnv === 'development') {
      runJob()
      cron.schedule('0 0 * * *', () => runJob())
    } else {
      runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
