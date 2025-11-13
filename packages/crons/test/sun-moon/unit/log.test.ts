import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'
import type { Logger } from '@workspace/utils'
import { logLocationData, logDataSaved, logError } from '../../../jobs/sun-moon/log'

describe('logLocationData', () => {
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      withContext: vi.fn().mockReturnThis(),
      flush: vi.fn()
    } as unknown as Logger
  })

  const createMockSunResponse = (overrides?: Partial<SunResponse['properties']>): SunResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-79.347015, 43.651070]
    },
    when: {
      interval: ['2025-01-01', '2025-01-02']
    },
    properties: {
      body: 'Sun',
      sunrise: {
        time: '2025-01-01T12:51:00Z',
        azimuth: 120.5
      },
      sunset: {
        time: '2025-01-01T21:45:00Z',
        azimuth: 239.5
      },
      solarnoon: {
        time: '2025-01-01T17:18:00Z',
        disc_centre_elevation: 23.45,
        visible: true
      },
      solarmidnight: {
        time: '2025-01-01T05:18:00Z',
        disc_centre_elevation: -66.55,
        visible: false
      },
      ...overrides
    }
  })

  const createMockMoonResponse = (overrides?: Partial<MoonResponse['properties']>): MoonResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-79.347015, 43.651070]
    },
    when: {
      interval: ['2025-01-01', '2025-01-02']
    },
    properties: {
      body: 'Moon',
      moonrise: {
        time: '2025-01-01T14:30:00Z',
        azimuth: 95.2
      },
      moonset: {
        time: '2025-01-01T23:15:00Z',
        azimuth: 264.8
      },
      high_moon: {
        time: '2025-01-01T18:52:00Z',
        disc_centre_elevation: 45.3,
        visible: true
      },
      low_moon: {
        time: '2025-01-01T06:52:00Z',
        disc_centre_elevation: -45.3,
        visible: false
      },
      moonphase: 0.45,
      ...overrides
    }
  })

  describe('successful logging with valid data', () => {
    it('should log formatted sun and moon data with all times present', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, 'Toronto', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledOnce()
      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Toronto',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should log data for different location', () => {
      const sunData = createMockSunResponse({
        sunrise: {
          time: '2025-01-01T11:30:00Z',
          azimuth: 115.0
        },
        sunset: {
          time: '2025-01-01T22:15:00Z',
          azimuth: 245.0
        }
      })
      const moonData = createMockMoonResponse({
        moonrise: {
          time: '2025-01-01T15:00:00Z',
          azimuth: 100.0
        },
        moonset: {
          time: '2025-01-02T00:30:00Z',
          azimuth: 260.0
        }
      })

      logLocationData(mockLogger, 'Vancouver', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Vancouver',
        sunriseTime: '06:30',
        sunsetTime: '17:15',
        moonriseTime: '10:00',
        moonsetTime: '19:30',
        moonPhase: 0.45
      })
    })

    it('should format times correctly for different timezones', () => {
      const sunData = createMockSunResponse({
        sunrise: {
          time: '2025-01-01T18:45:00Z',
          azimuth: 120.0
        },
        sunset: {
          time: '2025-01-02T04:30:00Z',
          azimuth: 240.0
        }
      })
      const moonData = createMockMoonResponse({
        moonrise: {
          time: '2025-01-01T19:20:00Z',
          azimuth: 95.0
        },
        moonset: {
          time: '2025-01-01T06:05:00Z',
          azimuth: 265.0
        }
      })

      logLocationData(mockLogger, 'London', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'London',
        sunriseTime: '13:45',
        sunsetTime: '23:30',
        moonriseTime: '14:20',
        moonsetTime: '01:05',
        moonPhase: 0.45
      })
    })

    it('should handle different moon phases', () => {
      const testCases = [
        { phase: 0, name: 'New Moon' },
        { phase: 0.25, name: 'First Quarter' },
        { phase: 0.5, name: 'Full Moon' },
        { phase: 0.75, name: 'Last Quarter' },
        { phase: 0.99, name: 'Waning Crescent' }
      ]

      testCases.forEach(({ phase, name }) => {
        const sunData = createMockSunResponse()
        const moonData = createMockMoonResponse({ moonphase: phase })

        logLocationData(mockLogger, name, sunData, moonData)

        const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
        const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
        expect(lastCall[1]).toMatchObject({
          moonPhase: phase
        })
      })
    })
  })

  describe('handling null/undefined values', () => {
    it('should log "NULL" when sunrise is null', () => {
      const sunData = createMockSunResponse({ sunrise: null })
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, 'Arctic', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Arctic',
        sunriseTime: 'NULL',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when sunset is null', () => {
      const sunData = createMockSunResponse({ sunset: null })
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, 'Arctic', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Arctic',
        sunriseTime: '07:51',
        sunsetTime: 'NULL',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when both sunrise and sunset are null (polar night)', () => {
      const sunData = createMockSunResponse({ sunrise: null, sunset: null })
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, 'Polar Night', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Polar Night',
        sunriseTime: 'NULL',
        sunsetTime: 'NULL',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when moonrise is null', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonrise: null })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: 'NULL',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when moonset is null', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonset: null })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: 'NULL',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when both moonrise and moonset are null', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonrise: null, moonset: null })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: 'NULL',
        moonsetTime: 'NULL',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when moonphase is null', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonphase: null })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 'NULL'
      })
    })

    it('should handle all values being null', () => {
      const sunData = createMockSunResponse({ sunrise: null, sunset: null })
      const moonData = createMockMoonResponse({ moonrise: null, moonset: null, moonphase: null })

      logLocationData(mockLogger, 'Extreme', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Extreme',
        sunriseTime: 'NULL',
        sunsetTime: 'NULL',
        moonriseTime: 'NULL',
        moonsetTime: 'NULL',
        moonPhase: 'NULL'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty location name', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, '', sunData, moonData)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).toMatchObject({
        location: ''
      })
    })

    it('should handle location name with special characters', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse()

      logLocationData(mockLogger, 'São Paulo, Brazil (Test)', sunData, moonData)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).toMatchObject({
        location: 'São Paulo, Brazil (Test)'
      })
    })

    it('should handle midnight times (00:00)', () => {
      const sunData = createMockSunResponse({
        sunrise: {
          time: '2025-01-01T05:00:00Z',
          azimuth: 120.0
        }
      })
      const moonData = createMockMoonResponse({
        moonrise: {
          time: '2025-01-01T05:00:00Z',
          azimuth: 95.0
        }
      })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '00:00',
        sunsetTime: '16:45',
        moonriseTime: '00:00',
        moonsetTime: '18:15',
        moonPhase: 0.45
      })
    })

    it('should handle moonphase value of 0 (not null)', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonphase: 0 })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 0
      })
    })

    it('should handle moonphase value of 1', () => {
      const sunData = createMockSunResponse()
      const moonData = createMockMoonResponse({ moonphase: 1 })

      logLocationData(mockLogger, 'Location', sunData, moonData)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        sunriseTime: '07:51',
        sunsetTime: '16:45',
        moonriseTime: '09:30',
        moonsetTime: '18:15',
        moonPhase: 1
      })
    })
  })
})

describe('logDataSaved', () => {
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      withContext: vi.fn().mockReturnThis(),
      flush: vi.fn()
    } as unknown as Logger
  })

  it('should log successful save with date and location count', () => {
    logDataSaved(mockLogger, '2025-01-01', 5)

    expect(mockLogger.info).toHaveBeenCalledOnce()
    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '2025-01-01',
      locationCount: 5
    })
  })

  it('should handle single location', () => {
    logDataSaved(mockLogger, '2025-01-15', 1)

    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '2025-01-15',
      locationCount: 1
    })
  })

  it('should handle zero locations', () => {
    logDataSaved(mockLogger, '2025-01-01', 0)

    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '2025-01-01',
      locationCount: 0
    })
  })

  it('should handle large location count', () => {
    logDataSaved(mockLogger, '2025-12-31', 1000)

    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '2025-12-31',
      locationCount: 1000
    })
  })

  it('should handle different date formats', () => {
    const dates = [
      '2025-01-01',
      '2025-12-31',
      '2025-06-15',
      '2024-02-29' // Leap year
    ]

    dates.forEach(date => {
      logDataSaved(mockLogger, date, 3)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
      const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
      expect(lastCall[1]).toMatchObject({
        date
      })
    })
  })

  it('should handle empty date string', () => {
    logDataSaved(mockLogger, '', 5)

    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '',
      locationCount: 5
    })
  })

  it('should handle negative location count', () => {
    logDataSaved(mockLogger, '2025-01-01', -1)

    expect(mockLogger.info).toHaveBeenCalledWith('Sun and moon data saved successfully', {
      date: '2025-01-01',
      locationCount: -1
    })
  })
})

describe('logError', () => {
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      withContext: vi.fn().mockReturnThis(),
      flush: vi.fn()
    } as unknown as Logger
  })

  describe('Error object handling', () => {
    it('should log Error instance with message and stack', () => {
      const error = new Error('Test error message')

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledOnce()
      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'Test error message',
        stack: expect.any(String)
      })
    })

    it('should log Error with location when provided', () => {
      const error = new Error('Location-specific error')

      logError(mockLogger, error, 'Toronto')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        location: 'Toronto',
        error: 'Location-specific error',
        stack: expect.any(String)
      })
    })

    it('should log Error without location field when location is undefined', () => {
      const error = new Error('General error')

      logError(mockLogger, error, undefined)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'General error',
        stack: expect.any(String)
      })

      const calls = (mockLogger.error as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).not.toHaveProperty('location')
    })

    it('should include stack trace in error log', () => {
      const error = new Error('Error with stack')

      logError(mockLogger, error)

      const calls = (mockLogger.error as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1].stack).toBeDefined()
      expect(firstCall[1].stack).toContain('Error: Error with stack')
    })

    it('should handle Error with empty message', () => {
      const error = new Error('')

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: '',
        stack: expect.any(String)
      })
    })

    it('should handle TypeError', () => {
      const error = new TypeError('Type error occurred')

      logError(mockLogger, error, 'Vancouver')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        location: 'Vancouver',
        error: 'Type error occurred',
        stack: expect.any(String)
      })
    })

    it('should handle RangeError', () => {
      const error = new RangeError('Value out of range')

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'Value out of range',
        stack: expect.any(String)
      })
    })
  })

  describe('non-Error object handling', () => {
    it('should convert string to error message', () => {
      logError(mockLogger, 'String error message')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'String error message',
        stack: undefined
      })
    })

    it('should convert number to error message', () => {
      logError(mockLogger, 404)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: '404',
        stack: undefined
      })
    })

    it('should convert boolean to error message', () => {
      logError(mockLogger, false)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'false',
        stack: undefined
      })
    })

    it('should convert null to error message', () => {
      logError(mockLogger, null)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'null',
        stack: undefined
      })
    })

    it('should convert undefined to error message', () => {
      logError(mockLogger, undefined)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'undefined',
        stack: undefined
      })
    })

    it('should convert object to string representation', () => {
      const errorObj = { code: 'ERR_001', details: 'Something went wrong' }

      logError(mockLogger, errorObj)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: '[object Object]',
        stack: undefined
      })
    })

    it('should convert array to string representation', () => {
      const errorArray = ['error1', 'error2']

      logError(mockLogger, errorArray)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'error1,error2',
        stack: undefined
      })
    })

    it('should handle string error with location', () => {
      logError(mockLogger, 'API rate limit exceeded', 'London')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        location: 'London',
        error: 'API rate limit exceeded',
        stack: undefined
      })
    })
  })

  describe('location parameter handling', () => {
    it('should handle empty string location', () => {
      const error = new Error('Test error')

      logError(mockLogger, error, '')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'Test error',
        stack: expect.any(String)
      })

      const calls = (mockLogger.error as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).not.toHaveProperty('location')
    })

    it('should handle location with special characters', () => {
      const error = new Error('Test error')

      logError(mockLogger, error, 'São Paulo, Brazil')

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        location: 'São Paulo, Brazil',
        error: 'Test error',
        stack: expect.any(String)
      })
    })

    it('should handle very long location name', () => {
      const error = new Error('Test error')
      const longLocation = 'A'.repeat(1000)

      logError(mockLogger, error, longLocation)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        location: longLocation,
        error: 'Test error',
        stack: expect.any(String)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle Error with custom properties', () => {
      const error = new Error('Custom error') as Error & { customProp: string }
      error.customProp = 'custom value'

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'Custom error',
        stack: expect.any(String)
      })
    })

    it('should handle Error without stack trace', () => {
      const error = new Error('No stack error')
      error.stack = undefined

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'No stack error',
        stack: undefined
      })
    })

    it('should handle symbol as error', () => {
      const symbolError = Symbol('error')

      logError(mockLogger, symbolError)

      expect(mockLogger.error).toHaveBeenCalledWith('Error in sun-moon job', {
        error: 'Symbol(error)',
        stack: undefined
      })
    })

    it('should call logger.error exactly once', () => {
      const error = new Error('Test')

      logError(mockLogger, error)

      expect(mockLogger.error).toHaveBeenCalledTimes(1)
    })

    it('should not call other logger methods', () => {
      const error = new Error('Test')

      logError(mockLogger, error)

      expect(mockLogger.info).not.toHaveBeenCalled()
      expect(mockLogger.warn).not.toHaveBeenCalled()
      expect(mockLogger.debug).not.toHaveBeenCalled()
    })
  })
})
