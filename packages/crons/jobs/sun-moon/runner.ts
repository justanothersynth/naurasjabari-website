import { format } from 'date-fns'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { logError } from '@workspace/utils'
import { createJobRunner } from '../create-job-runner'
import { fetchSunMoonData } from './fetch-data'
import { LOCATIONS } from './locations'
import { logLocationData, logDataSaved } from './log'
import { writeData } from './write-data'

/**
 * Fetches sun and moon data for all locations and saves to files
 */
export const { job, subcommand, runJob } = createJobRunner({
  runJob: async ({ jobLogger, settings }) => {
    jobLogger.info('Job started: Fetching sun and moon data', {
      locations: Object.keys(LOCATIONS).join(', ')
    })

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
      await writeData(sunDataByLocation, moonDataByLocation, settings?.outputDir ?? '../../packages/api/static/data')

      logDataSaved(jobLogger, date, Object.keys(sunDataByLocation).length)
    } catch (error) {
      logError(
        jobLogger,
        error,
        'Error in sun-moon job',
        currentlLocationBeingFetched ? { location: currentlLocationBeingFetched } : undefined
      )
      throw error
    }
  }
})
