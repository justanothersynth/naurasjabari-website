import { format } from 'date-fns'
import type { SunResponse, MoonResponse } from '@workspace/types'
import type { Logger } from '@workspace/utils'

export const logLocationData = (
  jobLogger: Logger,
  locationName: string,
  sunData: SunResponse,
  moonData: MoonResponse
) => {
  // Format sun times
  const sunriseTime = sunData.properties.sunrise?.time
    ? format(new Date(sunData.properties.sunrise.time), 'HH:mm')
    : 'NULL'
  const sunsetTime = sunData.properties.sunset?.time
    ? format(new Date(sunData.properties.sunset.time), 'HH:mm')
    : 'NULL'
  
  // Format moon times and phase
  const moonriseTime = moonData.properties.moonrise?.time
    ? format(new Date(moonData.properties.moonrise.time), 'HH:mm')
    : 'NULL'
  const moonsetTime = moonData.properties.moonset?.time
    ? format(new Date(moonData.properties.moonset.time), 'HH:mm')
    : 'NULL'
  const moonPhase = moonData.properties.moonphase ?? 'NULL'
  
  jobLogger.info('Location data', {
    location: locationName,
    sunriseTime,
    sunsetTime,
    moonriseTime,
    moonsetTime,
    moonPhase
  })
}

export const logDataSaved = (
  jobLogger: Logger,
  date: string,
  locationCount: number
) => {
  jobLogger.info('Sun and moon data saved successfully', {
    date,
    locationCount
  })
}

export const logError = (jobLogger: Logger, error: unknown, location?: string) => {
  jobLogger.error('Error in sun-moon job', {
    ...(location && { location }),
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
}
