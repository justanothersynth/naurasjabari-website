import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SunMoonMetadata } from '@workspace/types'
import type { Logger } from '@workspace/utils'
import { logLocationData, logSuccess } from '../../../jobs/azimuth/log'

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

  const createMockMetadata = (overrides?: Partial<SunMoonMetadata>): SunMoonMetadata => ({
    sunAzimuth: 180.5,
    moonAzimuth: 95.3,
    moonPhase: 0.45,
    period: 'day',
    sunriseTime: '07:30',
    sunriseAzimuth: 120.0,
    sunsetTime: '18:45',
    sunsetAzimuth: 240.0,
    moonriseTime: '09:15',
    moonriseAzimuth: 95.0,
    moonsetTime: '20:30',
    moonsetAzimuth: 265.0,
    ...overrides
  })

  describe('successful logging with valid data', () => {
    it('should log azimuth data with all values present', () => {
      const data = createMockMetadata()

      logLocationData(mockLogger, 'Toronto', data)

      expect(mockLogger.info).toHaveBeenCalledOnce()
      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Toronto',
        period: 'day',
        sunAzimuth: '180.50',
        moonAzimuth: '95.30',
        moonPhase: 0.45
      })
    })

    it('should log data for different location', () => {
      const data = createMockMetadata({
        sunAzimuth: 270.15,
        moonAzimuth: 110.85,
        moonPhase: 0.75,
        period: 'night'
      })

      logLocationData(mockLogger, 'Vancouver', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Vancouver',
        period: 'night',
        sunAzimuth: '270.15',
        moonAzimuth: '110.85',
        moonPhase: 0.75
      })
    })

    it('should format azimuth values to 2 decimal places', () => {
      const data = createMockMetadata({
        sunAzimuth: 180.123456,
        moonAzimuth: 95.987654
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.12',
        moonAzimuth: '95.99',
        moonPhase: 0.45
      })
    })

    it('should handle different time periods', () => {
      const testCases = [
        { period: 'day' as const, name: 'Daytime Location' },
        { period: 'night' as const, name: 'Nighttime Location' }
      ]

      testCases.forEach(({ period, name }) => {
        const data = createMockMetadata({ period })

        logLocationData(mockLogger, name, data)

        const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
        const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
        expect(lastCall[1]).toMatchObject({
          period
        })
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
        const data = createMockMetadata({ moonPhase: phase })

        logLocationData(mockLogger, name, data)

        const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
        const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
        expect(lastCall[1]).toMatchObject({
          moonPhase: phase
        })
      })
    })

    it('should handle azimuth at cardinal directions', () => {
      const data = createMockMetadata({
        sunAzimuth: 0,
        moonAzimuth: 90
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '0.00',
        moonAzimuth: '90.00',
        moonPhase: 0.45
      })
    })

    it('should handle azimuth at 180 and 270 degrees', () => {
      const data = createMockMetadata({
        sunAzimuth: 180,
        moonAzimuth: 270
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.00',
        moonAzimuth: '270.00',
        moonPhase: 0.45
      })
    })

    it('should handle azimuth at maximum value', () => {
      const data = createMockMetadata({
        sunAzimuth: 359.99,
        moonAzimuth: 359.99
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '359.99',
        moonAzimuth: '359.99',
        moonPhase: 0.45
      })
    })
  })

  describe('handling null/undefined values', () => {
    it('should log "NULL" when period is null', () => {
      const data = createMockMetadata({ period: null })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'NULL',
        sunAzimuth: '180.50',
        moonAzimuth: '95.30',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when sunAzimuth is null', () => {
      const data = createMockMetadata({ sunAzimuth: null })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: 'NULL',
        moonAzimuth: '95.30',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when moonAzimuth is null', () => {
      const data = createMockMetadata({ moonAzimuth: null })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.50',
        moonAzimuth: 'NULL',
        moonPhase: 0.45
      })
    })

    it('should log "NULL" when moonPhase is null', () => {
      const data = createMockMetadata({ moonPhase: null })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.50',
        moonAzimuth: '95.30',
        moonPhase: 'NULL'
      })
    })

    it('should log "NULL" when both azimuths are null', () => {
      const data = createMockMetadata({ sunAzimuth: null, moonAzimuth: null })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: 'NULL',
        moonAzimuth: 'NULL',
        moonPhase: 0.45
      })
    })

    it('should handle all values being null', () => {
      const data = createMockMetadata({
        period: null,
        sunAzimuth: null,
        moonAzimuth: null,
        moonPhase: null
      })

      logLocationData(mockLogger, 'Extreme', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Extreme',
        period: 'NULL',
        sunAzimuth: 'NULL',
        moonAzimuth: 'NULL',
        moonPhase: 'NULL'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty location name', () => {
      const data = createMockMetadata()

      logLocationData(mockLogger, '', data)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).toMatchObject({
        location: ''
      })
    })

    it('should handle location name with special characters', () => {
      const data = createMockMetadata()

      logLocationData(mockLogger, 'São Paulo, Brazil (Test)', data)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
      const firstCall = calls[0] as [string, Record<string, unknown>]
      expect(firstCall[1]).toMatchObject({
        location: 'São Paulo, Brazil (Test)'
      })
    })

    it('should handle moonPhase value of 0 (not null)', () => {
      const data = createMockMetadata({ moonPhase: 0 })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.50',
        moonAzimuth: '95.30',
        moonPhase: 0
      })
    })

    it('should handle moonPhase value of 1', () => {
      const data = createMockMetadata({ moonPhase: 1 })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.50',
        moonAzimuth: '95.30',
        moonPhase: 1
      })
    })

    it('should handle very small azimuth values', () => {
      const data = createMockMetadata({
        sunAzimuth: 0.001,
        moonAzimuth: 0.009
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '0.00',
        moonAzimuth: '0.01',
        moonPhase: 0.45
      })
    })

    it('should handle very precise azimuth values with many decimal places', () => {
      const data = createMockMetadata({
        sunAzimuth: 180.123456789,
        moonAzimuth: 95.987654321
      })

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledWith('Location data', {
        location: 'Location',
        period: 'day',
        sunAzimuth: '180.12',
        moonAzimuth: '95.99',
        moonPhase: 0.45
      })
    })

    it('should call logger.info exactly once', () => {
      const data = createMockMetadata()

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.info).toHaveBeenCalledTimes(1)
    })

    it('should not call other logger methods', () => {
      const data = createMockMetadata()

      logLocationData(mockLogger, 'Location', data)

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(mockLogger.warn).not.toHaveBeenCalled()
      expect(mockLogger.debug).not.toHaveBeenCalled()
    })
  })
})

describe('logSuccess', () => {
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

  describe('successful logging', () => {
    it('should log successful creation with date and location count', () => {
      const currentTime = new Date('2025-01-01T12:00:00Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.info).toHaveBeenCalledOnce()
      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-01-01T12:00:00.000Z',
        locationCount: 5
      })
    })

    it('should handle single location', () => {
      const currentTime = new Date('2025-01-15T08:30:00Z')

      logSuccess(mockLogger, currentTime, 1)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-01-15T08:30:00.000Z',
        locationCount: 1
      })
    })

    it('should handle zero locations', () => {
      const currentTime = new Date('2025-01-01T00:00:00Z')

      logSuccess(mockLogger, currentTime, 0)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-01-01T00:00:00.000Z',
        locationCount: 0
      })
    })

    it('should handle large location count', () => {
      const currentTime = new Date('2025-12-31T23:59:59Z')

      logSuccess(mockLogger, currentTime, 1000)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-12-31T23:59:59.000Z',
        locationCount: 1000
      })
    })

    it('should format date as ISO string', () => {
      const currentTime = new Date('2025-06-15T14:30:45.123Z')

      logSuccess(mockLogger, currentTime, 3)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-06-15T14:30:45.123Z',
        locationCount: 3
      })
    })

    it('should handle different times of day', () => {
      const testCases = [
        { time: new Date('2025-01-01T00:00:00Z'), name: 'Midnight' },
        { time: new Date('2025-01-01T12:00:00Z'), name: 'Noon' },
        { time: new Date('2025-01-01T06:30:00Z'), name: 'Morning' },
        { time: new Date('2025-01-01T18:45:00Z'), name: 'Evening' },
        { time: new Date('2025-01-01T23:59:59.999Z'), name: 'End of day' }
      ]

      testCases.forEach(({ time }) => {
        logSuccess(mockLogger, time, 5)

        const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
        const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
        expect(lastCall[1]).toMatchObject({
          date: time.toISOString()
        })
      })
    })

    it('should handle different dates throughout the year', () => {
      const dates = [
        new Date('2025-01-01T12:00:00Z'),
        new Date('2025-03-15T12:00:00Z'),
        new Date('2025-06-21T12:00:00Z'),
        new Date('2025-09-23T12:00:00Z'),
        new Date('2025-12-31T12:00:00Z')
      ]

      dates.forEach(date => {
        logSuccess(mockLogger, date, 3)

        const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls
        const lastCall = calls[calls.length - 1] as [string, Record<string, unknown>]
        expect(lastCall[1]).toMatchObject({
          date: date.toISOString()
        })
      })
    })
  })

  describe('edge cases', () => {
    it('should handle negative location count', () => {
      const currentTime = new Date('2025-01-01T12:00:00Z')

      logSuccess(mockLogger, currentTime, -1)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-01-01T12:00:00.000Z',
        locationCount: -1
      })
    })

    it('should handle very old date', () => {
      const currentTime = new Date('1970-01-01T00:00:00Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '1970-01-01T00:00:00.000Z',
        locationCount: 5
      })
    })

    it('should handle far future date', () => {
      const currentTime = new Date('2099-12-31T23:59:59Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2099-12-31T23:59:59.000Z',
        locationCount: 5
      })
    })

    it('should handle leap year date', () => {
      const currentTime = new Date('2024-02-29T12:00:00Z')

      logSuccess(mockLogger, currentTime, 8)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2024-02-29T12:00:00.000Z',
        locationCount: 8
      })
    })

    it('should handle date with milliseconds', () => {
      const currentTime = new Date('2025-01-01T12:34:56.789Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.info).toHaveBeenCalledWith('Azimuth data created successfully', {
        date: '2025-01-01T12:34:56.789Z',
        locationCount: 5
      })
    })

    it('should call logger.info exactly once', () => {
      const currentTime = new Date('2025-01-01T12:00:00Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.info).toHaveBeenCalledTimes(1)
    })

    it('should not call other logger methods', () => {
      const currentTime = new Date('2025-01-01T12:00:00Z')

      logSuccess(mockLogger, currentTime, 5)

      expect(mockLogger.error).not.toHaveBeenCalled()
      expect(mockLogger.warn).not.toHaveBeenCalled()
      expect(mockLogger.debug).not.toHaveBeenCalled()
    })
  })

  describe('multiple calls', () => {
    it('should handle multiple sequential log calls', () => {
      const dates = [
        new Date('2025-01-01T12:00:00Z'),
        new Date('2025-01-02T12:00:00Z'),
        new Date('2025-01-03T12:00:00Z')
      ]

      dates.forEach((date, index) => {
        logSuccess(mockLogger, date, index + 1)
      })

      expect(mockLogger.info).toHaveBeenCalledTimes(3)
    })

    it('should correctly log each call with different parameters', () => {
      logSuccess(mockLogger, new Date('2025-01-01T12:00:00Z'), 5)
      logSuccess(mockLogger, new Date('2025-01-02T14:30:00Z'), 10)

      const calls = (mockLogger.info as ReturnType<typeof vi.fn>).mock.calls

      expect(calls[0]).toEqual([
        'Azimuth data created successfully',
        {
          date: '2025-01-01T12:00:00.000Z',
          locationCount: 5
        }
      ])

      expect(calls[1]).toEqual([
        'Azimuth data created successfully',
        {
          date: '2025-01-02T14:30:00.000Z',
          locationCount: 10
        }
      ])
    })
  })
})
