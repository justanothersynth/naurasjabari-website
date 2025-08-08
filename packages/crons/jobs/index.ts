import { subcommand as githubContributionsCommand } from './github-contrib'
import { subcommand as openMeteoCommand } from './sun-moon'
import { subcommand as azimuthCommand } from './azimuth'

export const subcommands = [
  githubContributionsCommand,
  openMeteoCommand,
  azimuthCommand
]
