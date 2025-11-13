import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from '../job.types'
import { config, logger } from '../../config'
import { redisConnection } from '../../config/redis'
import type { OrpcContext } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'
import { createLocation } from '@workspace/api/lib/sun-moon'
import { readSunMoonData } from './read-data'
import { processAzimuthData } from './process-data'
import { logLocationData, logSuccess, logError } from './log'

/* c8 ignore start */
export const OptionsSchema = z.object({})
const jobLogger = logger.withContext({ job: 'azimuth' })
/* c8 ignore stop */

const orpcContext: OrpcContext = {
  headers: {}
}

// Create worker queue
const azimuthQueue = new Queue('azimuth', { connection: redisConnection })

// Create the worker to process jobs
const worker = new Worker('azimuth', async () => {
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
    await azimuthQueue.pause() // Need to pause the queue first to prevent new jobs from being added
    await worker.close(true) // Force close the worker to stop active jobs immediately
    await azimuthQueue.obliterate({ force: true }) // Remove all jobs from the queue
    await azimuthQueue.close() // Close the queue connection
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
 * Creates per-second azimuth data
 */
export const runJob = async () => {
  /* c8 ignore start */
  jobLogger.info('Job started: Creating per-second azimuth data')
  /* c8 ignore stop */

  try {
    // Generate internal JWT for authentication
    const token = await generateInternalJWT(
      config.supabase.jwtSecret,
      config.supabase.jwtIssuer,
      config.supabase.jwtSubject
    )
    orpcContext.headers = { authorization: `Bearer ${token}` }

    // Read sun and moon data from files
    const { sunDataByLocation, moonDataByLocation } = await readSunMoonData()

    // Process the data to calculate normalized azimuths
    const metadata = processAzimuthData(sunDataByLocation, moonDataByLocation)
    
    // Create location data in database
    await createLocation.internal(orpcContext)(metadata)

    const currentTime = new Date()
    logSuccess(jobLogger, currentTime, Object.keys(metadata).length)

    // Log details for each location
    for (const [locationName, data] of Object.entries(metadata)) {
      logLocationData(jobLogger, locationName, data)
    }

  } catch (error) {
    logError(jobLogger, error)
    throw error
  }
}

export const job: Job = {
  name: 'azimuth',
  description: 'Creates per-second azimuth data',
  optionsSchema: OptionsSchema,
  async run() {
    await azimuthQueue.add('create-azimuth-data', {}, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 7,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      repeat: {
        pattern: '* * * * * *',
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
