import type { Logger } from '@workspace/utils'

export const logJobStart = (jobLogger: Logger, schedule: string, startYear: number, endYear: number) => {
  jobLogger.info('Job started: Fetching GitHub contributions', {
    schedule,
    startYear,
    endYear
  })
}

export const logYearFetched = (jobLogger: Logger, year: number, count: number) => {
  jobLogger.info('Fetched year contributions', {
    year,
    count
  })
}

export const logJobComplete = (jobLogger: Logger, totalContributions: number, yearsProcessed: number) => {
  jobLogger.info('GitHub contributions job completed', {
    totalContributions: totalContributions.toLocaleString(),
    yearsProcessed
  })
}

export const logYearError = (jobLogger: Logger, error: unknown, year: number) => {
  jobLogger.error('Failed to fetch year contributions', {
    year,
    error: error instanceof Error ? error.message : String(error)
  })
}
