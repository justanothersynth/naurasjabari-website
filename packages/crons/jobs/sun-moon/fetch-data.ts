import { format } from 'date-fns'
import { z } from 'zod'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { SunResponseSchema, MoonResponseSchema } from '@workspace/types'

/**
 * Fetches sun and moon data for a specific location
 */
export const fetchSunMoonData = async (location: { lat: number, lon: number, offset: string }) => {
  const baseUrl = 'https://api.met.no/weatherapi/sunrise/3.0'
  const date = format(new Date(Date.now()), 'yyyy-MM-dd')
  const params = `lat=${location.lat}&lon=${location.lon}&date=${date}&offset=${location.offset}`

  try {
    // Fetch sun data
    const sunResponse = await fetch(`${baseUrl}/sun?${params}`)
    if (!sunResponse.ok) {
      throw new Error(`Met.no sun API error: ${sunResponse.status} ${sunResponse.statusText}`)
    }
    const sunData = SunResponseSchema.parse(await sunResponse.json()) as SunResponse

    // Fetch moon data
    const moonResponse = await fetch(`${baseUrl}/moon?${params}`)
    if (!moonResponse.ok) {
      throw new Error(`Met.no moon API error: ${moonResponse.status} ${moonResponse.statusText}`)
    }
    const moonData = MoonResponseSchema.parse(await moonResponse.json()) as MoonResponse

    return {
      sun: sunData,
      moon: moonData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid API response format: ${error.message}`)
    }
    throw error
  }
}
