import { logError } from '@workspace/utils'
import { createJobRunner } from '../create-job-runner'
import { START_YEAR, getCurrentYear } from './config'
import { processData } from './process-data'
import { saveContributionsDataToFile } from './write-data'
import { logJobStart, logJobComplete } from './log'

/**
 * Scrapes the github contributions calendar for a user and saves the data to a file
 * @link https://github.com/users/timelytree/contributions
 */
export const { job, subcommand } = createJobRunner({
  runJob: async ({ jobLogger }) => {
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
})
