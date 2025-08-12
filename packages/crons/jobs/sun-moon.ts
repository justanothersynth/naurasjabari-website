import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import * as fs from 'fs/promises'
import * as path from 'path'
import { format } from 'date-fns'
import type { SunResponse, MoonResponse } from '@workspace/types'

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

/**
 * Fetches sun and moon data for a specific location
 */
const fetchSunMoonData = async (locationName: string, location: { lat: number, lon: number, offset: string }) => {
  const baseUrl = 'https://api.met.no/weatherapi/sunrise/3.0'
  const date = format(new Date(Date.now()), 'yyyy-MM-dd')
  const params = `lat=${location.lat}&lon=${location.lon}&date=${date}&offset=${location.offset}`

  const sunResponse = await fetch(`${baseUrl}/sun?${params}`)
  const sunData = await sunResponse.json() as SunResponse

  const moonResponse = await fetch(`${baseUrl}/moon?${params}`)
  const moonData = await moonResponse.json() as MoonResponse

  return {
    sun: sunData,
    moon: moonData
  }
}

/**
 * Fetches sun and moon data for all locations and saves to files
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  const locations = {
    toronto: {
      lat: 43.6331636987516,
      lon: -79.4052209221851,
      offset: '-04:00'
    },
    vancouver: {
      lat: 49.28695892813821,
      lon: -122.9906367731808,
      offset: '-07:00'
    },
    kosiv: {
      lat: 48.31190552772112,
      lon: 25.08750276251672,
      offset: '+03:00'
    },
    montreal: {
      lat: 45.49843176406388,
      lon: -73.59679126838567,
      offset: '-04:00'
    },
    heidelberg: {
      lat: 49.384717247235955,
      lon: 8.710628642202217,
      offset: '+02:00'
    },
    bristol: {
      lat: 51.461915032689305,
      lon: -2.6436497485357067,
      offset: '+01:00'
    },
    snowdonia: {
      lat: 52.915079284916125,
      lon: -3.899525933139459,
      offset: '+01:00'
    },
    sayulita: {
      lat: 20.87045807143342,
      lon: -105.4419350597342,
      offset: '-06:00'
    }
  }

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: sun-moon',
      `Fetching sun and moon data for:\n\n${Chalk.bold(Object.keys(locations).join(', '))}`,
      'info'
    )
  )

  const sunDataByLocation: Record<string, SunResponse> = {}
  const moonDataByLocation: Record<string, MoonResponse> = {}
  const date = format(new Date(Date.now()), 'yyyy-MM-dd')

  try {
    // Fetch data for all locations
    for (const [locationName, location] of Object.entries(locations)) {
      const { sun, moon } = await fetchSunMoonData(locationName, location)
      sunDataByLocation[locationName] = sun
      moonDataByLocation[locationName] = moon
    }

    // Ensure the static/data directory exists
    const staticDataDir = path.join(process.cwd(), '../../packages/api/static/data')
    await fs.mkdir(staticDataDir, { recursive: true })

    // Save sun data
    const sunOutputPath = path.join(staticDataDir, 'sun.json')
    await fs.writeFile(sunOutputPath, JSON.stringify(sunDataByLocation, null, 2), 'utf8')

    // Save moon data
    const moonOutputPath = path.join(staticDataDir, 'moon.json')
    await fs.writeFile(moonOutputPath, JSON.stringify(moonDataByLocation, null, 2), 'utf8')

    // Create summary for all locations
    let summary = `${Chalk.bold('Date:')} ${date}\n\n`
    
    for (const [locationName, sunData] of Object.entries(sunDataByLocation)) {
      const moonData = moonDataByLocation[locationName]
      if (!moonData) continue
      summary += `${Chalk.bold(locationName)}:\n`
      summary += `🌞 ${format(new Date(sunData.properties.sunrise.time), 'HH:mm')} - ${format(new Date(sunData.properties.sunset.time), 'HH:mm')}\n`
      summary += `🌕 ${format(new Date(moonData.properties.moonrise.time), 'HH:mm')} - ${format(new Date(moonData.properties.moonset.time), 'HH:mm')}, 🌙 ${moonData.properties.moonphase}\n\n`
    }
    
    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Sun and Moon Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in sun-moon job:', error)
    JOB_IS_RUNNING = false
  } finally {
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'sun-moon',
  description: 'Fetches sun and moon data from The Norwegian Meteorological Institute',
  optionsSchema: OptionsSchema,
  async run() {
    if (config.nodeEnv === 'development') {
      runJob()
      cron.schedule('0 0 * * *', () => runJob())
    } else {
      runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
