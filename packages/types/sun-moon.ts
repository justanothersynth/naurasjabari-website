import { z } from 'zod'

export const sunMoonMetadata = z.object({
  sunAzimuth: z.number(),
  moonAzimuth: z.number(),
  moonPhase: z.number(),
  period: z.enum(['day', 'night']),
  sunriseTime: z.string(),
  sunriseAzimuth: z.number(),
  sunsetTime: z.string(),
  sunsetAzimuth: z.number(),
  moonriseTime: z.string(),
  moonriseAzimuth: z.number(),
  moonsetTime: z.string(),
  moonsetAzimuth: z.number()
})

export const sunMoonOrpcInput = z.object({
  toronto: sunMoonMetadata,
  vancouver: sunMoonMetadata,
  kosiv: sunMoonMetadata,
  montreal: sunMoonMetadata,
  heidelberg: sunMoonMetadata,
  bristol: sunMoonMetadata,
  snowdonia: sunMoonMetadata,
  sayulita: sunMoonMetadata
})

export type SunMoonOrpcInput = z.infer<typeof sunMoonOrpcInput>
export type SunMoonMetadata = z.infer<typeof sunMoonMetadata>

// Extract location keys from the sunMoonOrpcInput schema
export const locationKeys = z.array(z.enum(['toronto', 'vancouver', 'kosiv', 'montreal', 'heidelberg', 'bristol', 'snowdonia', 'sayulita']))
export const locationKeysSchema = sunMoonOrpcInput.keyof()
export type SunMoonLocationKey = z.infer<typeof locationKeysSchema>

export interface SunMoonSupabase extends SunMoonOrpcInput {
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

// TypeScript interfaces for the MET Norway API responses
export interface Coordinates {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface TimeInterval {
  interval: [string, string] // ISO date strings
}

export interface SunProperties {
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

export interface MoonProperties {
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

export interface SunResponse {
  copyright: string
  licenseURL: string
  type: 'Feature'
  geometry: Coordinates
  when: TimeInterval
  properties: SunProperties
}

export interface MoonResponse {
  copyright: string
  licenseURL: string
  type: 'Feature'
  geometry: Coordinates
  when: TimeInterval
  properties: MoonProperties
}
