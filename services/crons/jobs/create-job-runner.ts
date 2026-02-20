import { z } from 'zod'
import { Queue, Worker } from 'bullmq'
import { Command } from 'commander'
import type { Job } from './job.types'
import { cronScheduleToHuman, getJobMetadata, type JobMetadata } from './registry'
import { logger } from '../config'
import { redisConnection } from '../config/redis'

type JobLogger = ReturnType<typeof logger.withContext>

export interface JobSettings {
  outputDir?: string
}

export interface JobContext {
  jobLogger: JobLogger
  schedule: string
  settings?: JobSettings
}

export interface JobRunnerConfig {
  runJob: (ctx: JobContext) => Promise<void>
}

export const createJobRunner = (config: JobRunnerConfig) => {
  /* c8 ignore start */
  const metadata = getJobMetadata(process.argv[2] as string) as JobMetadata
  const jobLogger = logger.withContext({ job: metadata.name })
  /* c8 ignore stop */

  const queue = new Queue(metadata.name, { connection: redisConnection })
  const schedule = cronScheduleToHuman(metadata.cronPattern)

  const worker = new Worker(metadata.name, async () => {
    await config.runJob({ jobLogger, schedule })
  }, { connection: redisConnection })

  /* c8 ignore start */
  worker.on('completed', job => {
    logger.info('Job completed', { jobId: job.id })
  })

  worker.on('failed', (job, err) => {
    logger.error('Job failed', { jobId: job?.id, error: err.message })
  })

  let isShuttingDown = false
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return
    isShuttingDown = true

    logger.info(`Received ${signal}, clearing worker queue and gracefully shutting down...`)

    try {
      await queue.pause()
      await worker.close(true)
      await queue.obliterate({ force: true })
      await queue.close()
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown', { error: error instanceof Error ? error.message : String(error) })
      process.exit(1)
    }
  }
  /* c8 ignore stop */

  const job: Job = {
    name: metadata.name,
    description: metadata.description,
    optionsSchema: z.object({}),
    async run() {
      process.on('SIGINT', () => shutdown('SIGINT'))
      process.on('SIGTERM', () => shutdown('SIGTERM'))

      await queue.add(metadata.name, {}, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 7,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        repeat: {
          pattern: metadata.cronPattern,
          immediately: true
        }
      })
    }
  }

  /* c8 ignore start */
  const subcommand = new Command(job.name)
    .description(job.description)
    .action(() => job.run())
  /* c8 ignore stop */

  // Wrapper for testing - calls runJob with the jobLogger context
  const runJobWrapper = (settings?: JobSettings) => config.runJob({ jobLogger, schedule, settings })

  return { job, subcommand, jobLogger, metadata, runJob: runJobWrapper }
}
