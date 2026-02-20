import { Command } from 'commander'
import { jobRegistry, getJobMetadata, getAvailableJobNames } from './jobs/registry'
import { logger } from './config'
import type { Job } from './jobs/job.types'

const program = new Command()

program
  .name('crons')
  .description('CLI tool for running jobs')
  .version('1.0.0')

// Register subcommands from job registry metadata
for (const jobMeta of jobRegistry) {
  program
    .command(jobMeta.name)
    .description(jobMeta.description)
    .action(async () => {
      const meta = getJobMetadata(jobMeta.name)
      // @ts-expect-error - meta is not undefined
      const jobModule = await import(meta.modulePath) as { job: Job }
      await jobModule.job.run()
    })
}

// List command to show available jobs
program
  .command('list')
  .description('List all available jobs')
  .action(() => {
    logger.info('Available jobs:')
    for (const name of getAvailableJobNames()) {
      const meta = getJobMetadata(name)
      logger.info(`  ${name} - ${meta?.description}`)
    }
  })

// Handle unknown commands
program.on('command:*', ([cmd]) => {
  logger.error('Job not found', { job: cmd, available: getAvailableJobNames().join(', ') })
  process.exit(1)
})

program.parse(process.argv)
