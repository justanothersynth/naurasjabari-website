import { z } from 'zod'

export const sunMoonMetadata = z.object({
  sunAzimuth: z.number().nullable(),
  moonAzimuth: z.number().nullable(),
  moonPhase: z.number().nullable(),
  period: z.enum(['day', 'night']).nullable(),
  sunriseTime: z.string().nullable(),
  sunriseAzimuth: z.number().nullable(),
  sunsetTime: z.string().nullable(),
  sunsetAzimuth: z.number().nullable(),
  moonriseTime: z.string().nullable(),
  moonriseAzimuth: z.number().nullable(),
  moonsetTime: z.string().nullable(),
  moonsetAzimuth: z.number().nullable()
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
    time: string | null
    azimuth: number | null
  } | null
  sunset: {
    time: string | null
    azimuth: number | null
  } | null
  solarnoon: {
    time: string | null
    disc_centre_elevation: number | null
    visible: boolean | null
  } | null
  solarmidnight: {
    time: string | null
    disc_centre_elevation: number | null
    visible: boolean | null
  } | null
}

export interface MoonProperties {
  body: 'Moon'
  moonrise: {
    time: string | null
    azimuth: number | null
  } | null
  moonset: {
    time: string | null
    azimuth: number | null
  } | null
  high_moon: {
    time: string | null
    disc_centre_elevation: number | null
    visible: boolean | null
  } | null
  low_moon: {
    time: string | null
    disc_centre_elevation: number | null
    visible: boolean | null
  } | null
  moonphase: number | null
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

// Zod schemas for runtime validation of Met.no API responses
const CoordinatesSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
})

const TimeIntervalSchema = z.object({
  interval: z.tuple([z.string(), z.string()])
})

const SunPropertiesSchema = z.object({
  body: z.literal('Sun'),
  sunrise: z.object({
    time: z.string().nullable(),
    azimuth: z.number().nullable()
  }).nullable(),
  sunset: z.object({
    time: z.string().nullable(),
    azimuth: z.number().nullable()
  }).nullable(),
  solarnoon: z.object({
    time: z.string().nullable(),
    disc_centre_elevation: z.number().nullable(),
    visible: z.boolean().nullable()
  }).nullable(),
  solarmidnight: z.object({
    time: z.string().nullable(),
    disc_centre_elevation: z.number().nullable(),
    visible: z.boolean().nullable()
  }).nullable()
})

const MoonPropertiesSchema = z.object({
  body: z.literal('Moon'),
  moonrise: z.object({
    time: z.string().nullable(),
    azimuth: z.number().nullable()
  }).nullable(),
  moonset: z.object({
    time: z.string().nullable(),
    azimuth: z.number().nullable()
  }).nullable(),
  high_moon: z.object({
    time: z.string().nullable(),
    disc_centre_elevation: z.number().nullable(),
    visible: z.boolean().nullable()
  }).nullable(),
  low_moon: z.object({
    time: z.string().nullable(),
    disc_centre_elevation: z.number().nullable(),
    visible: z.boolean().nullable()
  }).nullable(),
  moonphase: z.number().nullable()
})

export const SunResponseSchema = z.object({
  copyright: z.string(),
  licenseURL: z.string(),
  type: z.literal('Feature'),
  geometry: CoordinatesSchema,
  when: TimeIntervalSchema,
  properties: SunPropertiesSchema
})

export const MoonResponseSchema = z.object({
  copyright: z.string(),
  licenseURL: z.string(),
  type: z.literal('Feature'),
  geometry: CoordinatesSchema,
  when: TimeIntervalSchema,
  properties: MoonPropertiesSchema
})
