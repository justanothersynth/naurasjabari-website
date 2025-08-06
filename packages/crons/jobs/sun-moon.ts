import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
// import { delay } from '@workspace/utils'
// import * as cheerio from 'cheerio'
import * as fs from 'fs/promises'
import * as path from 'path'
import { format } from 'date-fns'

// TypeScript interfaces for the MET Norway API responses
interface Coordinates {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

interface TimeInterval {
  interval: [string, string] // ISO date strings
}

interface SunProperties {
  body: 'Sun'
  sunrise: {
    time: string
    azimuth: number
  }
  sunset: {
    time: string
    azimuth: number
  }
  solarnoon: {
    time: string
    disc_centre_elevation: number
    visible: boolean
  }
  solarmidnight: {
    time: string
    disc_centre_elevation: number
    visible: boolean
  }
}

interface MoonProperties {
  body: 'Moon'
  moonrise: {
    time: string
    azimuth: number
  }
  moonset: {
    time: string
    azimuth: number
  }
  high_moon: {
    time: string
    disc_centre_elevation: number
    visible: boolean
  }
  low_moon: {
    time: string
    disc_centre_elevation: number
    visible: boolean
  }
  moonphase: number
}

interface SunResponse {
  copyright: string
  licenseURL: string
  type: 'Feature'
  geometry: Coordinates
  when: TimeInterval
  properties: SunProperties
}

interface MoonResponse {
  copyright: string
  licenseURL: string
  type: 'Feature'
  geometry: Coordinates
  when: TimeInterval
  properties: MoonProperties
}

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

/**
 * Scrapes the github contributions calendar for a user and saves the data to a file
 * @link https://github.com/users/timelytree/contributions
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: sun-moon',
      `Fetching sun and moon data`,
      'info'
    )
  )

  const baseUrl = 'https://api.met.no/weatherapi/sunrise/3.0'
  const latitude = 43.3234212234634
  const longitude = -79.79471981518594
  const date = format(new Date(Date.now()), 'yyyy-MM-dd')
  const offset = '-05:00'
  const params = `lat=${latitude}&lon=${longitude}&date=${date}&offset=${offset}`

  try {
    const sunResponse = await fetch(`${baseUrl}/sun?${params}`)
    const sunJson = await sunResponse.json() as SunResponse
    const sunOutputPath = path.join(process.cwd(), '../../packages/api/static/data/sun.json')
    await fs.writeFile(sunOutputPath, JSON.stringify(sunJson, null, 2), 'utf8')

    const moonResponse = await fetch(`${baseUrl}/moon?${params}`)
    const moonJson = await moonResponse.json() as MoonResponse
    const moonOutputPath = path.join(process.cwd(), '../../packages/api/static/data/moon.json')
    await fs.writeFile(moonOutputPath, JSON.stringify(moonJson, null, 2), 'utf8')

    let summary = `${Chalk.bold('Date:')} ${date}\n\n`
    summary += `🌞 ${format(new Date(sunJson.properties.sunrise.time), 'HH:mm')} - ${format(new Date(sunJson.properties.sunset.time), 'HH:mm')}\n`
    summary += `🌕 ${format(new Date(moonJson.properties.moonrise.time), 'HH:mm')} - ${format(new Date(moonJson.properties.moonset.time), 'HH:mm')}, 🌙 ${moonJson.properties.moonphase}\n`
    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Sun and Moon Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in GitHub contributions job:', error)
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
