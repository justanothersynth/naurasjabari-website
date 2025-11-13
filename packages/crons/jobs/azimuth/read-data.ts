import fs from 'fs'
import path from 'path'
import type { MoonResponse, SunResponse } from '@workspace/types'
import { delay } from '@workspace/utils'

/**
 * Reads sun and moon data from static JSON files
 * @returns Object containing sun and moon data by location
 * @throws Error if files don't exist (after 10 second delay for retry)
 */
export const readSunMoonData = async (): Promise<{
  sunDataByLocation: Record<string, SunResponse>
  moonDataByLocation: Record<string, MoonResponse>
}> => {
  const sunPath = path.join(process.cwd(), '../../packages/api/static/data/sun.json')
  const moonPath = path.join(process.cwd(), '../../packages/api/static/data/moon.json')

  try {
    // Check if files exist
    if (!fs.existsSync(sunPath) || !fs.existsSync(moonPath)) {
      // Delay 10 seconds before throwing error to trigger retry
      await delay(10000)
      throw new Error('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }

    const sunDataRaw = fs.readFileSync(sunPath, 'utf8')
    const moonDataRaw = fs.readFileSync(moonPath, 'utf8')
    
    const sunDataByLocation: Record<string, SunResponse> = JSON.parse(sunDataRaw)
    const moonDataByLocation: Record<string, MoonResponse> = JSON.parse(moonDataRaw)

    return {
      sunDataByLocation,
      moonDataByLocation
    }
  } catch (error) {
    // If the error is ENOENT (file not found), delay and throw to trigger retry
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await delay(10000)
      throw new Error('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }
    throw error
  }
}
