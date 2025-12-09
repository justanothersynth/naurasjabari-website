import type { OrpcContext } from '@workspace/types'
import { generateInternalJWT, logError } from '@workspace/utils'
import { createLocation } from '@workspace/api/lib/sun-moon'
import { config } from '../../config'
import { createJobRunner } from '../create-job-runner'
import { readSunMoonData } from './read-data'
import { processAzimuthData } from './process-data'
import { logLocationData, logSuccess } from './log'

/**
 * Creates per-second azimuth data
 */
export const { job, subcommand, runJob } = createJobRunner({
  runJob: async ({ jobLogger, schedule }) => {
    jobLogger.info('Job started: Creating per-second azimuth data', { schedule })

    const orpcContext: OrpcContext = {
      headers: {}
    }

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
      // Type assertion: we know metadata has all required location keys in production
      await createLocation.internal(orpcContext)(metadata as import('@workspace/types').SunMoonOrpcInput)

      const currentTime = new Date()
      logSuccess(jobLogger, currentTime, Object.keys(metadata).length)

      // Log details for each location
      for (const [locationName, data] of Object.entries(metadata)) {
        logLocationData(jobLogger, locationName, data)
      }
    } catch (error) {
      logError(jobLogger, error, 'Error in azimuth job')
      throw error
    }
  }
})
