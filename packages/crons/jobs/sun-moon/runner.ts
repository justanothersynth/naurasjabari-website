import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from '../job.types'
import { logger } from '../../config'
import { redisConnection } from '../../config/redis'
import { format } from 'date-fns'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { fetchSunMoonData } from './fetch-data'
import { LOCATIONS } from './locations'
import { logLocationData, logDataSaved, logError } from './log'
import { writeData } from './write-data'

/* c8 ignore start */
export const OptionsSchema = z.object({})
const jobLogger = logger.withContext({ job: 'sun-moon' })
/* c8 ignore stop */

// Create worker queue
const sunMoonQueue = new Queue('sun-moon', { connection: redisConnection })

// Create the worker to process jobs
const worker = new Worker('sun-moon', async () => {
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
    await sunMoonQueue.pause() // Need to pause the queue first to prevent new jobs from being added
    await worker.close(true) // Force close the worker to stop active jobs immediately
    await sunMoonQueue.obliterate({ force: true }) // Remove all jobs from the queue
    await sunMoonQueue.close() // Close the queue connection
    process.exit(0) // Exit the process
  } catch (error) {
    logger.error('Error during shutdown', { error: error instanceof Error ? error.message : String(error) })
    process.exit(1) // Exit the process with an error code
  }
}

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
/* c8 ignore stop */

/**
 * Fetches sun and moon data for all locations and saves to files
 * @param outputDir - Optional directory path where files will be saved. Defaults to '../../packages/api/static/data'.
 */
export const runJob = async (outputDir = '../../packages/api/static/data') => {
  /* c8 ignore start */
  jobLogger.info('Job started: Fetching sun and moon data', {
    locations: Object.keys(LOCATIONS).join(', ')
  })
  /* c8 ignore stop */

  const sunDataByLocation: Record<string, SunResponse> = {}
  const moonDataByLocation: Record<string, MoonResponse> = {}
  const date = format(new Date(Date.now()), 'yyyy-MM-dd')
  let currentlLocationBeingFetched: string | undefined

  try {
    // Fetch data for all locations
    for (const [locationName, location] of Object.entries(LOCATIONS)) {
      currentlLocationBeingFetched = locationName
      const { sun, moon } = await fetchSunMoonData(location)
      sunDataByLocation[locationName] = sun
      moonDataByLocation[locationName] = moon
      logLocationData(jobLogger, locationName, sun, moon)
    }

    currentlLocationBeingFetched = undefined
    await writeData(sunDataByLocation, moonDataByLocation, outputDir)

    logDataSaved(jobLogger, date, Object.keys(sunDataByLocation).length)

  } catch (error) {
    logError(jobLogger, error, currentlLocationBeingFetched)
    throw error
  }
}

export const job: Job = {
  name: 'sun-moon',
  description: 'Fetches sun and moon data from The Norwegian Meteorological Institute',
  optionsSchema: OptionsSchema,
  async run() {
    await sunMoonQueue.add('fetch-sun-moon-data', {}, {
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
