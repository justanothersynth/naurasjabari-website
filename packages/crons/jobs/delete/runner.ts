import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from '../job.types'
import { logger } from '../../config'
import { config } from '../../config'
import { redisConnection } from '../../config/redis'
import { createPool, vacuumTable } from '@workspace/utils'
import { deleteAzimuthRecords } from './delete-azimuth'
import { deleteGeostormRecords } from './delete-geostorm'
import { logJobStart, logJobCompleted, logError } from './log'

/* c8 ignore start */
export const OptionsSchema = z.object({})
const jobLogger = logger.withContext({ job: 'delete' })
/* c8 ignore stop */

// Create worker queue
const deleteQueue = new Queue('delete', { connection: redisConnection })

// Create the worker to process jobs
const worker = new Worker('delete', async () => {
  await runJob()
}, { connection: redisConnection })

/* c8 ignore start */
worker.on('completed', job => {
  logger.info('Job completed', { jobId: job.id })
})

worker.on('failed', (job, err) => {
  logger.error('Job failed', { jobId: job?.id, error: err.message })
})

// Graceful shutdown handler
let isShuttingDown = false
const shutdown = async (signal: string) => {
  // Prevent multiple shutdown calls
  if (isShuttingDown) return
  isShuttingDown = true
  
  logger.info(`Received ${signal}, clearing worker queue and gracefully shutting down...`)
  
  try {
    await deleteQueue.pause() // Need to pause the queue first to prevent new jobs from being added
    await worker.close(true) // Force close the worker to stop active jobs immediately
    await deleteQueue.obliterate({ force: true }) // Remove all jobs from the queue
    await deleteQueue.close() // Close the queue connection
    process.exit(0) // Exit the process
  } catch (error) {
    logger.error('Error during shutdown', { error: error instanceof Error ? error.message : String(error) })
    process.exit(1) // Exit the process with an error code
  }
}
/* c8 ignore stop */

/**
 * Deletes azimuth data older than 1 hour (UTC) from the sun_moon table
 * and geostorm data older than 1 month (UTC) from the geostorm table
 */
export const runJob = async () => {
  /* c8 ignore start */
  logJobStart(jobLogger)
  /* c8 ignore stop */

  const pool = createPool(config.supabase.databaseUrl)

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
    const totalAzimuthDeleted = await deleteAzimuthRecords(
      pool,
      azimuthCutoffDate,
      BATCH_SIZE,
      jobLogger
    )

    // Run VACUUM FULL and ANALYZE on sun_moon table
    if (totalAzimuthDeleted > 0) {
      await vacuumTable(pool, 'sun_moon')
    }

    // Delete geostorm data older than 1 month (in batches of 25,000)
    const totalGeostormDeleted = await deleteGeostormRecords(
      pool,
      geostormCutoffDate,
      BATCH_SIZE,
      jobLogger
    )

    // Run VACUUM FULL and ANALYZE on geostorm table
    if (totalGeostormDeleted > 0) {
      await vacuumTable(pool, 'geostorm')
    }

    logJobCompleted(
      jobLogger,
      azimuthCutoffDate,
      totalAzimuthDeleted,
      geostormCutoffDate,
      totalGeostormDeleted
    )

  } catch (error) {
    logError(jobLogger, error)
    throw error
  } finally {
    // Always close the pool connection
    try {
      await pool.end()
    } catch (error) {
      logError(jobLogger, error, 'Error closing pool')
    }
  }
}

export const job: Job = {
  name: 'delete',
  description: 'Deletes azimuth data older than 1 hour and geostorm data older than 1 month',
  optionsSchema: OptionsSchema,
  async run() {
    // Register graceful shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    await deleteQueue.add('delete-old-data', {}, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 7,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      repeat: {
        pattern: '0 0 * * *',
        immediately: true
      }
    })
  }
}

/* c8 ignore start */
export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
/* c8 ignore stop */
