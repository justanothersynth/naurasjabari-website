import { Command } from 'commander'
import { subcommands } from './jobs'

const program = new Command()

program
  .name('crons')
  .description('CLI tool for running jobs')
  .version('1.0.0')

// Add all job subcommands directly to the main program
subcommands.forEach((subcommand) => {
  program.addCommand(subcommand)
})

program.parse(process.argv)
