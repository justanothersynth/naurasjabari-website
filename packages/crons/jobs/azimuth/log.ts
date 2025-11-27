import type { Logger } from '@workspace/utils'
import type { SunMoonMetadata } from '@workspace/types'

/**
 * Logs location-specific azimuth data
 */
export const logLocationData = (
  jobLogger: Logger,
  locationName: string,
  data: SunMoonMetadata
) => {
  jobLogger.info('Location data', {
    location: locationName,
    period: data.period ?? 'NULL',
    sunAzimuth: data.sunAzimuth?.toFixed(2) ?? 'NULL',
    moonAzimuth: data.moonAzimuth?.toFixed(2) ?? 'NULL',
    moonPhase: data.moonPhase ?? 'NULL'
  })
}

/**
 * Logs successful completion of azimuth data creation
 */
export const logSuccess = (
  jobLogger: Logger,
  currentTime: Date,
  locationCount: number
) => {
  jobLogger.info('Azimuth data created successfully', {
    date: currentTime.toISOString(),
    locationCount
  })
}
