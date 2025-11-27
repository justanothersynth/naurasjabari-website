import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from '../job.types'
import { logger } from '../../config'
import { redisConnection } from '../../config/redis'
import { START_YEAR, getCurrentYear } from './config'
import { processData } from './process-data'
import { saveContributionsDataToFile } from './write-data'
import { logError } from '@workspace/utils'
import { logJobStart, logJobComplete } from './log'

/* c8 ignore start */
export const OptionsSchema = z.object({})
const jobLogger = logger.withContext({ job: 'github-contrib' })
/* c8 ignore stop */

// Create worker queue
const githubContribQueue = new Queue('github-contrib', { connection: redisConnection })

// Create the worker to process jobs
const worker = new Worker('github-contrib', async () => {
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
    await githubContribQueue.pause() // Need to pause the queue first to prevent new jobs from being added
    await worker.close(true) // Force close the worker to stop active jobs immediately
    await githubContribQueue.obliterate({ force: true }) // Remove all jobs from the queue
    await githubContribQueue.close() // Close the queue connection
    process.exit(0) // Exit the process
  } catch (error) {
    logger.error('Error during shutdown', { error: error instanceof Error ? error.message : String(error) })
    process.exit(1) // Exit the process with an error code
  }
}
/* c8 ignore stop */

/**
 * Scrapes the github contributions calendar for a user and saves the data to a file
 * @link https://github.com/users/timelytree/contributions
 */
export const runJob = async () => {
  logJobStart(jobLogger, START_YEAR, getCurrentYear())

  try {
    const { contributionsByYear, totalContributions } = await processData(jobLogger)
    await saveContributionsDataToFile(contributionsByYear)
    logJobComplete(jobLogger, totalContributions, Object.keys(contributionsByYear).length)
  } catch (error) {
    logError(jobLogger, error, 'Error in GitHub contributions job')
    throw error
  }
}

export const job: Job = {
  name: 'github-contrib',
  description: 'Fetches GitHub contributions',
  optionsSchema: OptionsSchema,
  async run() {
    // Register graceful shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))

    await githubContribQueue.add('fetch-github-contrib-data', {}, {
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
