import { Command } from 'commander'
import { subcommands } from './jobs'

const program = new Command()

program
  .name('crons')
  .description('CLI tool for running jobs')
  .version('1.0.0')

// Create the parent "run" command
const runCommand = new Command('run').description('Run a specific job')

// Add all job subcommands to the run command
subcommands.forEach((subcommand) => {
  runCommand.addCommand(subcommand)
})

program.addCommand(runCommand)

program.parse(process.argv)
