import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config, logger } from '../config'
import type { MoonResponse, OrpcContext, SunResponse, SunMoonMetadata, SunMoonOrpcInput } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'
import { createLocation } from '@workspace/api/lib/sun-moon'
import fs from 'fs'
import path from 'path'

/**
 * Normalize azimuth to a day/night cycle where:
 * - 0° = Rise time
 * - 180° = Set time
 * - 180°-360° = Night/down time
 * @param currentTime - Current time
 * @param riseTime - Time of rise (sunrise, moonrise, etc.)
 * @param setTime - Time of set (sunset, moonset, etc.)
 * @returns Normalized azimuth (0° = Rise, 180° = Set, 180°-360° = Night)
 */
export const normalizeAzimuthToDayCycle = (
  currentTime: Date,
  riseTime: string,
  setTime: string
): number => {
  const rise = new Date(riseTime)
  const set = new Date(setTime)
  
  // If current time is between rise and set (up/visible time)
  if (currentTime >= rise && currentTime <= set) {
    const totalUpDuration = set.getTime() - rise.getTime()
    const elapsed = currentTime.getTime() - rise.getTime()
    const progress = elapsed / totalUpDuration
    
    // Map 0-1 progress to 0°-180° (rise to set)
    return progress * 180
  }
  
  // Down/night time calculation
  const nextRise = new Date(rise)
  nextRise.setDate(nextRise.getDate() + 1)
  
  let totalDownDuration: number
  let elapsed: number
  
  if (currentTime > set) {
    // Evening/night (after set, before midnight)
    totalDownDuration = nextRise.getTime() - set.getTime()
    elapsed = currentTime.getTime() - set.getTime()
  } else {
    // Early morning (after midnight, before rise)
    const previousSet = new Date(set)
    previousSet.setDate(previousSet.getDate() - 1)
    totalDownDuration = rise.getTime() - previousSet.getTime()
    elapsed = currentTime.getTime() - previousSet.getTime()
  }
  
  const downProgress = elapsed / totalDownDuration
  
  // Map down progress to 180°-360° (set to rise)
  const result = 180 + (downProgress * 180)
  
  // Ensure result is within 0-360 range (handles edge cases with timezone differences)
  return result % 360
}

export const OptionsSchema = z.object({})

const orpcContext: OrpcContext = {
  headers: {}
}

let JOB_IS_RUNNING = false

/**
 * Creates per-second azimuth data
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  const jobLogger = logger.withContext({ job: 'azimuth' })
  jobLogger.info('Job started: Creating per-second azimuth data')

  try {

    // Generate internal JWT for authentication
    const token = await generateInternalJWT(
      config.supabase.jwtSecret,
      config.supabase.jwtIssuer,
      config.supabase.jwtSubject
    )
    orpcContext.headers = { authorization: `Bearer ${token}` }

    const sunDataRaw = fs.readFileSync(path.join(process.cwd(), '../../packages/api/static/data/sun.json'), 'utf8')
    const moonDataRaw = fs.readFileSync(path.join(process.cwd(), '../../packages/api/static/data/moon.json'), 'utf8')
    
    const sunDataByLocation: Record<string, SunResponse> = JSON.parse(sunDataRaw)
    const moonDataByLocation: Record<string, MoonResponse> = JSON.parse(moonDataRaw)

    // Calculate normalized azimuth based on day/night cycle for all locations
    const currentTime = new Date()
    
    // Helper function to determine if it's day or night based on the azimuth
    const getSunMoonStatus = (azimuth: number): 'day' | 'night' => {
      return azimuth >= 0 && azimuth < 180 ? 'day' : 'night'
    }
    
    // Process each location and build the input object
    const metadata: SunMoonOrpcInput = {} as SunMoonOrpcInput
    
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
      
      (metadata as Record<string, SunMoonMetadata>)[locationName] = {
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
    
    await createLocation.internal(orpcContext)(metadata)

    jobLogger.info('Azimuth data created successfully', {
      date: currentTime.toISOString(),
      locationCount: Object.keys(metadata).length
    })

    // Log details for each location
    for (const [locationName, data] of Object.entries(metadata)) {
      jobLogger.info('Location data', {
        location: locationName,
        period: data.period ?? 'NULL',
        sunAzimuth: data.sunAzimuth?.toFixed(2) ?? 'NULL',
        moonAzimuth: data.moonAzimuth?.toFixed(2) ?? 'NULL',
        moonPhase: data.moonPhase ?? 'NULL'
      })
    }

  } catch (error) {
    jobLogger.error('Error in azimuth job', {
      error: error instanceof Error ? error.message : String(error)
    })
    JOB_IS_RUNNING = false
  } finally {
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'azimuth',
  description: 'Creates per-second azimuth data',
  optionsSchema: OptionsSchema,
  async run() {
    if (config.nodeEnv === 'development') {
      await runJob()
      cron.schedule('* * * * * *', () => runJob())
    } else {
      await runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
