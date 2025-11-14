import { delay } from '@workspace/utils'
import type { Logger } from '@workspace/utils'
import { START_YEAR, getCurrentYear } from './config'
import { fetchYearContributions } from './fetch-data'
import { loadExistingContributionsData } from './write-data'
import { logYearFetched, logYearError } from './log'
import type { ContributionsByYear } from './types'

/**
 * Processes GitHub contribution data for all years
 * Fetches data for each year from START_YEAR to current year,
 * handles errors per year, and returns accumulated data
 */
export const processData = async (jobLogger: Logger): Promise<{ contributionsByYear: ContributionsByYear, totalContributions: number }> => {
  const existingData = await loadExistingContributionsData()
  let totalContributions = 0
  const contributionsByYear: ContributionsByYear = {}

  for (let year = START_YEAR; year <= getCurrentYear(); year++) {
    try {
      const existingYearData = existingData[year.toString()]
      const yearData = await fetchYearContributions(year, existingYearData)
      
      totalContributions += yearData.count
      contributionsByYear[year.toString()] = yearData
      logYearFetched(jobLogger, year, yearData.count)

      if (year < getCurrentYear()) {
        await delay(2000)
      }
    } catch (error) {
      logYearError(jobLogger, error, year)
      contributionsByYear[year.toString()] = existingData[year.toString()] || {
        count: 0,
        calendar: {},
        monthPosition: {}
      }
      continue
    }
  }

  return { contributionsByYear, totalContributions }
}
