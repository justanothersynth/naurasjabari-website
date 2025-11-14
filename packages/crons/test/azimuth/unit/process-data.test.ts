import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { processAzimuthData } from '../../../jobs/azimuth/process-data'

describe('processAzimuthData', () => {
  let mockCurrentTime: Date

  beforeEach(() => {
    mockCurrentTime = new Date('2025-01-15T12:00:00-05:00')
    vi.useFakeTimers()
    vi.setSystemTime(mockCurrentTime)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const createMockSunResponse = (overrides?: Partial<SunResponse>): SunResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-79.3832, 43.6532]
    },
    when: {
      interval: ['2025-01-15T00:00:00Z', '2025-01-16T00:00:00Z']
    },
    properties: {
      body: 'Sun',
      sunrise: {
        time: '2025-01-15T07:30:00-05:00',
        azimuth: 120.5
      },
      sunset: {
        time: '2025-01-15T17:30:00-05:00',
        azimuth: 240.5
      },
      solarnoon: {
        time: '2025-01-15T12:30:00-05:00',
        disc_centre_elevation: 30.0,
        visible: true
      },
      solarmidnight: {
        time: '2025-01-15T00:30:00-05:00',
        disc_centre_elevation: -30.0,
        visible: false
      }
    },
    ...overrides
  })

  const createMockMoonResponse = (overrides?: Partial<MoonResponse>): MoonResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-79.3832, 43.6532]
    },
    when: {
      interval: ['2025-01-15T00:00:00Z', '2025-01-16T00:00:00Z']
    },
    properties: {
      body: 'Moon',
      moonrise: {
        time: '2025-01-15T09:00:00-05:00',
        azimuth: 95.0
      },
      moonset: {
        time: '2025-01-15T20:00:00-05:00',
        azimuth: 265.0
      },
      high_moon: {
        time: '2025-01-15T14:30:00-05:00',
        disc_centre_elevation: 45.0,
        visible: true
      },
      low_moon: {
        time: '2025-01-15T02:30:00-05:00',
        disc_centre_elevation: -45.0,
        visible: false
      },
      moonphase: 0.5
    },
    ...overrides
  })

  describe('successful data processing with valid inputs', () => {
    it('should process single location with complete data', () => {
      const sunData = {
        'toronto': createMockSunResponse()
      }
      const moonData = {
        'toronto': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result).toHaveProperty('toronto')
      expect(result.toronto).toMatchObject({
        moonPhase: 0.5,
        sunriseTime: '2025-01-15T07:30:00-05:00',
        sunriseAzimuth: 120.5,
        sunsetTime: '2025-01-15T17:30:00-05:00',
        sunsetAzimuth: 240.5,
        moonriseTime: '2025-01-15T09:00:00-05:00',
        moonriseAzimuth: 95.0,
        moonsetTime: '2025-01-15T20:00:00-05:00',
        moonsetAzimuth: 265.0
      })
      expect(result.toronto!.sunAzimuth).toBeCloseTo(81, 0)
      expect(result.toronto!.moonAzimuth).toBeCloseTo(49, 0)
      expect(result.toronto!.period).toBe('day')
    })

    it('should process multiple locations', () => {
      const sunData = {
        'toronto': createMockSunResponse(),
        'vancouver': createMockSunResponse(),
        'montreal': createMockSunResponse()
      }
      const moonData = {
        'toronto': createMockMoonResponse(),
        'vancouver': createMockMoonResponse(),
        'montreal': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(Object.keys(result)).toHaveLength(3)
      expect(result).toHaveProperty('toronto')
      expect(result).toHaveProperty('vancouver')
      expect(result).toHaveProperty('montreal')
    })

    it('should calculate correct normalized azimuths during daytime', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      // At noon (12:00), between 7:30 sunrise and 17:30 sunset
      // 4.5 hours / 10 hours = 0.45 * 180 = 81°
      expect(result.location!.sunAzimuth).toBeCloseTo(81, 0)
      expect(result.location!.period).toBe('day')
    })

    it('should calculate period as day when sun is up', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.period).toBe('day')
      expect(result.location!.sunAzimuth).toBeLessThan(180)
    })

    it('should copy all sun metadata fields correctly', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunriseTime).toBe('2025-01-15T07:30:00-05:00')
      expect(result.location!.sunriseAzimuth).toBe(120.5)
      expect(result.location!.sunsetTime).toBe('2025-01-15T17:30:00-05:00')
      expect(result.location!.sunsetAzimuth).toBe(240.5)
    })

    it('should copy all moon metadata fields correctly', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonriseTime).toBe('2025-01-15T09:00:00-05:00')
      expect(result.location!.moonriseAzimuth).toBe(95.0)
      expect(result.location!.moonsetTime).toBe('2025-01-15T20:00:00-05:00')
      expect(result.location!.moonsetAzimuth).toBe(265.0)
      expect(result.location!.moonPhase).toBe(0.5)
    })
  })

  describe('handling missing moon data', () => {
    it('should skip location when moon data is missing', () => {
      const sunData = {
        'toronto': createMockSunResponse(),
        'vancouver': createMockSunResponse()
      }
      const moonData = {
        'toronto': createMockMoonResponse()
        // vancouver moon data is missing
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result).toHaveProperty('toronto')
      expect(result).not.toHaveProperty('vancouver')
      expect(Object.keys(result)).toHaveLength(1)
    })

    it('should return empty object when no moon data exists', () => {
      const sunData = {
        'toronto': createMockSunResponse(),
        'vancouver': createMockSunResponse()
      }
      const moonData = {}

      const result = processAzimuthData(sunData, moonData)

      expect(result).toEqual({})
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should process only locations with matching moon data', () => {
      const sunData = {
        'toronto': createMockSunResponse(),
        'vancouver': createMockSunResponse(),
        'montreal': createMockSunResponse()
      }
      const moonData = {
        'toronto': createMockMoonResponse(),
        'montreal': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(Object.keys(result)).toHaveLength(2)
      expect(result).toHaveProperty('toronto')
      expect(result).toHaveProperty('montreal')
      expect(result).not.toHaveProperty('vancouver')
    })
  })

  describe('handling null sunrise/sunset times', () => {
    it('should set sunAzimuth to null when sunrise time is missing', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: null,
            sunset: {
              time: '2025-01-15T17:30:00-05:00',
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeNull()
      expect(result.location!.period).toBeNull()
    })

    it('should set sunAzimuth to null when sunset time is missing', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T07:30:00-05:00',
              azimuth: 120.5
            },
            sunset: null,
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeNull()
      expect(result.location!.period).toBeNull()
    })

    it('should set sunAzimuth to null when both sunrise and sunset are missing', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: null,
            sunset: null,
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeNull()
      expect(result.location!.period).toBeNull()
    })

    it('should set sunAzimuth to null when sunrise.time is null', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: null,
              azimuth: 120.5
            },
            sunset: {
              time: '2025-01-15T17:30:00-05:00',
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeNull()
      expect(result.location!.period).toBeNull()
    })

    it('should set sunAzimuth to null when sunset.time is null', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T07:30:00-05:00',
              azimuth: 120.5
            },
            sunset: {
              time: null,
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeNull()
      expect(result.location!.period).toBeNull()
    })
  })

  describe('handling null moonrise/moonset times', () => {
    it('should set moonAzimuth to null when moonrise time is missing', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: null,
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBeNull()
      expect(result.location!.sunAzimuth).not.toBeNull()
    })

    it('should set moonAzimuth to null when moonset time is missing', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: null,
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBeNull()
      expect(result.location!.sunAzimuth).not.toBeNull()
    })

    it('should set moonAzimuth to null when both moonrise and moonset are missing', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: null,
            moonset: null,
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBeNull()
      expect(result.location!.sunAzimuth).not.toBeNull()
    })

    it('should set moonAzimuth to null when moonrise.time is null', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: null,
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBeNull()
    })

    it('should set moonAzimuth to null when moonset.time is null', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: null,
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBeNull()
    })
  })

  describe('handling null azimuth values in metadata', () => {
    it('should copy null sunrise azimuth to result', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T07:30:00-05:00',
              azimuth: null
            },
            sunset: {
              time: '2025-01-15T17:30:00-05:00',
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunriseAzimuth).toBeNull()
      expect(result.location!.sunriseTime).toBe('2025-01-15T07:30:00-05:00')
    })

    it('should copy null sunset azimuth to result', () => {
      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T07:30:00-05:00',
              azimuth: 120.5
            },
            sunset: {
              time: '2025-01-15T17:30:00-05:00',
              azimuth: null
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunsetAzimuth).toBeNull()
      expect(result.location!.sunsetTime).toBe('2025-01-15T17:30:00-05:00')
    })

    it('should copy null moonrise azimuth to result', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: null
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonriseAzimuth).toBeNull()
      expect(result.location!.moonriseTime).toBe('2025-01-15T09:00:00-05:00')
    })

    it('should copy null moonset azimuth to result', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: null
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonsetAzimuth).toBeNull()
      expect(result.location!.moonsetTime).toBe('2025-01-15T20:00:00-05:00')
    })

    it('should copy null moonphase to result', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: null
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonPhase).toBeNull()
    })
  })

  describe('edge cases and empty inputs', () => {
    it('should return empty object when both inputs are empty', () => {
      const result = processAzimuthData({}, {})

      expect(result).toEqual({})
    })

    it('should return empty object when sun data is empty', () => {
      const moonData = {
        'toronto': createMockMoonResponse()
      }

      const result = processAzimuthData({}, moonData)

      expect(result).toEqual({})
    })

    it('should return empty object when moon data is empty', () => {
      const sunData = {
        'toronto': createMockSunResponse()
      }

      const result = processAzimuthData(sunData, {})

      expect(result).toEqual({})
    })

    it('should handle location names with special characters', () => {
      const sunData = {
        'são-paulo': createMockSunResponse()
      }
      const moonData = {
        'são-paulo': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result).toHaveProperty('são-paulo')
    })

    it('should handle location names with spaces', () => {
      const sunData = {
        'New York': createMockSunResponse()
      }
      const moonData = {
        'New York': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result).toHaveProperty('New York')
    })

    it('should process all eight expected locations', () => {
      const locations = ['toronto', 'vancouver', 'kosiv', 'montreal', 'heidelberg', 'bristol', 'snowdonia', 'sayulita']
      const sunData: Record<string, SunResponse> = {}
      const moonData: Record<string, MoonResponse> = {}

      locations.forEach(location => {
        sunData[location] = createMockSunResponse()
        moonData[location] = createMockMoonResponse()
      })

      const result = processAzimuthData(sunData, moonData)

      expect(Object.keys(result)).toHaveLength(8)
      locations.forEach(location => {
        expect(result).toHaveProperty(location)
      })
    })
  })

  describe('nighttime calculations', () => {
    it('should calculate period as night when current time is after sunset', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.period).toBe('night')
      expect(result.location!.sunAzimuth).toBeGreaterThan(180)
    })

    it('should calculate period as night when current time is before sunrise', () => {
      vi.setSystemTime(new Date('2025-01-15T05:00:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.period).toBe('night')
      expect(result.location!.sunAzimuth).toBeGreaterThan(180)
    })

    it('should calculate correct azimuth at midnight', () => {
      vi.setSystemTime(new Date('2025-01-16T00:00:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.period).toBe('night')
      expect(result.location!.sunAzimuth).toBeGreaterThan(250)
      expect(result.location!.sunAzimuth).toBeLessThan(280)
    })
  })

  describe('boundary times', () => {
    it('should handle time exactly at sunrise', () => {
      vi.setSystemTime(new Date('2025-01-15T07:30:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBe(0)
      expect(result.location!.period).toBe('day')
    })

    it('should handle time exactly at sunset', () => {
      vi.setSystemTime(new Date('2025-01-15T17:30:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBe(180)
      expect(result.location!.period).toBe('night')
    })

    it('should handle time exactly at moonrise', () => {
      vi.setSystemTime(new Date('2025-01-15T09:00:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBe(0)
    })

    it('should handle time exactly at moonset', () => {
      vi.setSystemTime(new Date('2025-01-15T20:00:00-05:00'))

      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse()
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonAzimuth).toBe(180)
    })
  })

  describe('moon phase values', () => {
    it('should handle new moon (phase 0)', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonPhase).toBe(0)
    })

    it('should handle full moon (phase 0.5)', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonPhase).toBe(0.5)
    })

    it('should handle phase approaching 1', () => {
      const sunData = {
        'location': createMockSunResponse()
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-05:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-05:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.99
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.moonPhase).toBe(0.99)
    })
  })

  describe('different timezones', () => {
    it('should handle UTC timezone', () => {
      vi.setSystemTime(new Date('2025-01-15T17:00:00Z'))

      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T12:30:00Z',
              azimuth: 120.5
            },
            sunset: {
              time: '2025-01-15T22:30:00Z',
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T14:00:00Z',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-16T01:00:00Z',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!).toBeDefined()
      expect(result.location!.sunAzimuth).toBeDefined()
      expect(result.location!.moonAzimuth).toBeDefined()
    })

    it('should handle Pacific timezone', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00-08:00'))

      const sunData = {
        'location': createMockSunResponse({
          properties: {
            body: 'Sun',
            sunrise: {
              time: '2025-01-15T07:30:00-08:00',
              azimuth: 120.5
            },
            sunset: {
              time: '2025-01-15T17:30:00-08:00',
              azimuth: 240.5
            },
            solarnoon: null,
            solarmidnight: null
          }
        })
      }
      const moonData = {
        'location': createMockMoonResponse({
          properties: {
            body: 'Moon',
            moonrise: {
              time: '2025-01-15T09:00:00-08:00',
              azimuth: 95.0
            },
            moonset: {
              time: '2025-01-15T20:00:00-08:00',
              azimuth: 265.0
            },
            high_moon: null,
            low_moon: null,
            moonphase: 0.5
          }
        })
      }

      const result = processAzimuthData(sunData, moonData)

      expect(result.location!.sunAzimuth).toBeCloseTo(81, 0)
      expect(result.location!.period).toBe('day')
    })
  })
})
