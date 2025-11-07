import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import type { MoonResponse, OrpcContext, SunResponse, SunMoonMetadata, SunMoonOrpcInput } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'
import { createLocation } from '@workspace/api/lib/sun-moon'
import fs from 'fs'
import path from 'path'

/**
 * Normalize azimuth to a day/night cycle where:
 * - 0° = Sunrise
 * - 180° = Sunset
 * - 180°-360° = Night time
 * @param currentTime - Current time
 * @param sunriseTime - Time of sunrise
 * @param sunsetTime - Time of sunset
 * @returns Normalized azimuth (0° = Sunrise, 180° = Sunset, 180°-360° = Night)
 */
const normalizeAzimuthToDayCycle = (
  currentTime: Date,
  sunriseTime: string,
  sunsetTime: string
): number => {
  const sunrise = new Date(sunriseTime)
  const sunset = new Date(sunsetTime)
  
  // If current time is between sunrise and sunset (daytime)
  if (currentTime >= sunrise && currentTime <= sunset) {
    const totalDayDuration = sunset.getTime() - sunrise.getTime()
    const elapsed = currentTime.getTime() - sunrise.getTime()
    const progress = elapsed / totalDayDuration
    
    // Map 0-1 progress to 0°-180° (sunrise to sunset)
    return progress * 180
  }
  
  // Night time calculation
  const nextDay = new Date(sunrise)
  nextDay.setDate(nextDay.getDate() + 1)
  
  let totalNightDuration: number
  let elapsed: number
  
  if (currentTime > sunset) {
    // Evening/night (after sunset, before midnight)
    totalNightDuration = nextDay.getTime() - sunset.getTime()
    elapsed = currentTime.getTime() - sunset.getTime()
  } else {
    // Early morning (after midnight, before sunrise)
    const previousSunset = new Date(sunset)
    previousSunset.setDate(previousSunset.getDate() - 1)
    totalNightDuration = sunrise.getTime() - previousSunset.getTime()
    elapsed = currentTime.getTime() - previousSunset.getTime()
  }
  
  const nightProgress = elapsed / totalNightDuration
  
  // Map night progress to 180°-360° (sunset to sunrise)
  return 180 + (nightProgress * 180)
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

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: azimuth',
      'Creating per-second azimuth data',
      'info'
    )
  )

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
    const getSunMoonStatus = (azimuth: number) => {
      return azimuth >= 0 && azimuth < 180 ? 'day' : 'night'
    }
    
    // Process each location and build the input object
    const metadata: SunMoonOrpcInput = {} as SunMoonOrpcInput
    
    for (const [locationName, sunData] of Object.entries(sunDataByLocation)) {
      const moonData = moonDataByLocation[locationName]
      if (!moonData) continue
      
      // For the sun: normalize to day/night cycle (0° = sunrise, 180° = sunset, 180°-360° = night)
      const normalizedSunAzimuth = normalizeAzimuthToDayCycle(
        currentTime,
        sunData.properties.sunrise.time,
        sunData.properties.sunset.time
      )
      
      // For the moon: normalize to its own rise/set cycle
      const normalizedMoonAzimuth = normalizeAzimuthToDayCycle(
        currentTime,
        moonData.properties.moonrise.time,
        moonData.properties.moonset.time
      )

      const period = getSunMoonStatus(normalizedSunAzimuth) as SunMoonMetadata['period']
      
      (metadata as Record<string, SunMoonMetadata>)[locationName] = {
        sunAzimuth: normalizedSunAzimuth,
        moonAzimuth: normalizedMoonAzimuth,
        moonPhase: moonData.properties.moonphase,
        period,
        sunriseTime: sunData.properties.sunrise.time,
        sunriseAzimuth: sunData.properties.sunrise.azimuth,
        sunsetTime: sunData.properties.sunset.time,
        sunsetAzimuth: sunData.properties.sunset.azimuth,
        moonriseTime: moonData.properties.moonrise.time,
        moonriseAzimuth: moonData.properties.moonrise.azimuth,
        moonsetTime: moonData.properties.moonset.time,
        moonsetAzimuth: moonData.properties.moonset.azimuth
      }
    }
    
    await createLocation.internal(orpcContext)(metadata)

    let summary = `${Chalk.bold('Date:')} ${currentTime.toISOString()}\n\n`
    
    for (const [locationName, data] of Object.entries(metadata)) {
      summary += `${Chalk.bold(locationName)}:\n`
      summary += `🌅 ${data.period ?? 'NULL'} | 🌞 ${data.sunAzimuth?.toFixed(2) ?? 'NULL'}° | 🌕 ${data.moonAzimuth?.toFixed(2) ?? 'NULL'}° | 🌙 ${data.moonPhase ?? 'NULL'}°\n\n`
    }
    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Sun and Moon Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in azimuth job:', error)
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
      runJob()
      cron.schedule('* * * * * *', () => runJob())
    } else {
      runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
