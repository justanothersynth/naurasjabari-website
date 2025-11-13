import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from '../job.types'
import { logger } from '../../config'
import { redisConnection } from '../../config/redis'
import { fetchData } from './fetch-data'
import { writeData } from './write-data'
import { logJobStart, logJobSuccess, logError } from './log'

/* c8 ignore start */
export const OptionsSchema = z.object({})
const jobLogger = logger.withContext({ job: 'geostorm' })
/* c8 ignore stop */

// Create worker queue
const geostormQueue = new Queue('geostorm', { connection: redisConnection })

// Create the worker to process jobs
const worker = new Worker('geostorm', async () => {
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
    await geostormQueue.pause() // Need to pause the queue first to prevent new jobs from being added
    await worker.close(true) // Force close the worker to stop active jobs immediately
    await geostormQueue.obliterate({ force: true }) // Remove all jobs from the queue
    await geostormQueue.close() // Close the queue connection
    process.exit(0) // Exit the process
  } catch (error) {
    logger.error('Error during shutdown', { error: error instanceof Error ? error.message : String(error) })
    process.exit(1) // Exit the process with an error code
  }
}
/* c8 ignore stop */

/**
 * Scrapes the geostorm data from the government of Canada
 * @link https://naurasjabari-website-edge.vercel.app/api/geostorm fetches from 👇
 * @link https://www.spaceweather.gc.ca/forecast-prevision/short-court/zone-en.php
 */
export const runJob = async () => {
  logJobStart(jobLogger)

  try {
    const data = await fetchData()
    await writeData(data)
    logJobSuccess(jobLogger, data)
  } catch (error) {
    logError(jobLogger, error)
    throw error
  }
}

export const job: Job = {
  name: 'geostorm',
  description: 'Fetches geostorm data from the government of Canada',
  optionsSchema: OptionsSchema,
  async run() {
    // Register graceful shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    await geostormQueue.add('fetch-geostorm-data', {}, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 7,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      repeat: {
        pattern: '*/15 * * * *',
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
