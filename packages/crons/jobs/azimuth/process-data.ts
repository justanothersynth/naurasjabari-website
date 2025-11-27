import type { MoonResponse, SunResponse, SunMoonMetadata } from '@workspace/types'
import { normalizeAzimuthToDayCycle, getSunMoonStatus } from './normalize-azimuth'

/**
 * Processes sun and moon data to calculate normalized azimuths for all locations
 * @param sunDataByLocation - Sun data indexed by location name
 * @param moonDataByLocation - Moon data indexed by location name
 * @returns Metadata object with normalized azimuth data for each location
 */
export const processAzimuthData = (
  sunDataByLocation: Record<string, SunResponse>,
  moonDataByLocation: Record<string, MoonResponse>
): Record<string, SunMoonMetadata> => {
  const currentTime = new Date()
  const metadata: Record<string, SunMoonMetadata> = {}
  
  for (const [locationName, sunData] of Object.entries(sunDataByLocation)) {
    const moonData = moonDataByLocation[locationName]
    if (!moonData) continue
    
    // Calculate normalized azimuths if data is available
    let normalizedSunAzimuth: number | null = null
    let normalizedMoonAzimuth: number | null = null
    
    // For the sun: normalize to day/night cycle (0° = sunrise, 180° = sunset, 180°-360° = night)
    if (sunData.properties.sunrise?.time && sunData.properties.sunset?.time) {
      normalizedSunAzimuth = normalizeAzimuthToDayCycle(
        currentTime,
        sunData.properties.sunrise.time,
        sunData.properties.sunset.time
      )
    }
    
    // For the moon: normalize to its own rise/set cycle
    if (moonData.properties.moonrise?.time && moonData.properties.moonset?.time) {
      normalizedMoonAzimuth = normalizeAzimuthToDayCycle(
        currentTime,
        moonData.properties.moonrise.time,
        moonData.properties.moonset.time
      )
    }
    
    metadata[locationName] = {
      sunAzimuth: normalizedSunAzimuth,
      moonAzimuth: normalizedMoonAzimuth,
      moonPhase: moonData.properties.moonphase,
      period: normalizedSunAzimuth !== null ? getSunMoonStatus(normalizedSunAzimuth) : null,
      sunriseTime: sunData.properties.sunrise?.time ?? null,
      sunriseAzimuth: sunData.properties.sunrise?.azimuth ?? null,
      sunsetTime: sunData.properties.sunset?.time ?? null,
      sunsetAzimuth: sunData.properties.sunset?.azimuth ?? null,
      moonriseTime: moonData.properties.moonrise?.time ?? null,
      moonriseAzimuth: moonData.properties.moonrise?.azimuth ?? null,
      moonsetTime: moonData.properties.moonset?.time ?? null,
      moonsetAzimuth: moonData.properties.moonset?.azimuth ?? null
    }
  }
  
  return metadata
}
