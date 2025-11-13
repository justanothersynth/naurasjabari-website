import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runJob } from '../../../jobs/sun-moon/runner'
import { fetchSunMoonData } from '../../../jobs/sun-moon/fetch-data'
import { logLocationData, logDataSaved, logError } from '../../../jobs/sun-moon/log'
import { writeData } from '../../../jobs/sun-moon/write-data'
import { LOCATIONS } from '../../../jobs/sun-moon/locations'
import type { SunResponse, MoonResponse } from '@workspace/types'

vi.mock('../../../jobs/sun-moon/fetch-data')
vi.mock('../../../jobs/sun-moon/log')
vi.mock('../../../jobs/sun-moon/write-data')

describe('runJob (unit)', () => {
  const mockSunResponse: SunResponse = {
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
        time: '2025-01-01T07:51:00-05:00',
        azimuth: 120.5
      },
      sunset: {
        time: '2025-01-01T16:45:00-05:00',
        azimuth: 239.5
      },
      solarnoon: {
        time: '2025-01-01T12:18:00-05:00',
        disc_centre_elevation: 23.45,
        visible: true
      },
      solarmidnight: {
        time: '2025-01-01T00:18:00-05:00',
        disc_centre_elevation: -66.55,
        visible: false
      }
    }
  }

  const mockMoonResponse: MoonResponse = {
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
        time: '2025-01-01T09:30:00-05:00',
        azimuth: 95.2
      },
      moonset: {
        time: '2025-01-01T18:15:00-05:00',
        azimuth: 264.8
      },
      high_moon: {
        time: '2025-01-01T13:52:00-05:00',
        disc_centre_elevation: 45.3,
        visible: true
      },
      low_moon: {
        time: '2025-01-01T01:52:00-05:00',
        disc_centre_elevation: -45.3,
        visible: false
      },
      moonphase: 0.45
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchSunMoonData).mockResolvedValue({
      sun: mockSunResponse,
      moon: mockMoonResponse
    })
    vi.mocked(writeData).mockResolvedValue(undefined)
    vi.mocked(logLocationData).mockReturnValue(undefined)
    vi.mocked(logDataSaved).mockReturnValue(undefined)
    vi.mocked(logError).mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('success path', () => {
    it('should fetch data for all locations from LOCATIONS', async () => {
      await runJob()

      expect(fetchSunMoonData).toHaveBeenCalledTimes(Object.keys(LOCATIONS).length)

      // Verify each location was called with correct parameters
      Object.entries(LOCATIONS).forEach(([_, location]) => {
        expect(fetchSunMoonData).toHaveBeenCalledWith(location)
      })
    })

    it('should call fetchSunMoonData for each location with correct params', async () => {
      await runJob()

      // Check first location (toronto)
      expect(fetchSunMoonData).toHaveBeenCalledWith({
        lat: 43.6331636987516,
        lon: -79.4052209221851,
        offset: '-04:00'
      })

      // Check another location (vancouver)
      expect(fetchSunMoonData).toHaveBeenCalledWith({
        lat: 49.28695892813821,
        lon: -122.9906367731808,
        offset: '-07:00'
      })
    })

    it('should call logLocationData for each location with fetched data', async () => {
      await runJob()

      expect(logLocationData).toHaveBeenCalledTimes(Object.keys(LOCATIONS).length)

      // Verify each location was logged
      Object.keys(LOCATIONS).forEach(locationName => {
        expect(logLocationData).toHaveBeenCalledWith(
          expect.anything(), // logger
          locationName,
          mockSunResponse,
          mockMoonResponse
        )
      })
    })

    it('should call writeData with aggregated sun/moon data', async () => {
      await runJob()

      expect(writeData).toHaveBeenCalledTimes(1)

      // Should be called with all locations' data
      const writeDataCall = vi.mocked(writeData).mock.calls[0]
      expect(writeDataCall).toBeDefined()
      if (!writeDataCall) return
      const [sunData, moonData] = writeDataCall

      expect(Object.keys(sunData)).toHaveLength(Object.keys(LOCATIONS).length)
      expect(Object.keys(moonData)).toHaveLength(Object.keys(LOCATIONS).length)

      // Verify all location names are present
      Object.keys(LOCATIONS).forEach(locationName => {
        expect(sunData).toHaveProperty(locationName)
        expect(moonData).toHaveProperty(locationName)
      })
    })

    it('should call logDataSaved with correct date and count', async () => {
      await runJob()

      expect(logDataSaved).toHaveBeenCalledTimes(1)
      expect(logDataSaved).toHaveBeenCalledWith(
        expect.anything(), // logger
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // date format YYYY-MM-DD
        Object.keys(LOCATIONS).length
      )
    })

    it('should use custom outputDir when provided', async () => {
      const customOutputDir = '/custom/path/to/output'

      await runJob(customOutputDir)

      expect(writeData).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        customOutputDir
      )
    })

    it('should use default outputDir when not provided', async () => {
      await runJob()

      expect(writeData).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        '../../packages/api/static/data'
      )
    })

    it('should aggregate all location data correctly', async () => {
      await runJob()

      const writeDataCall = vi.mocked(writeData).mock.calls[0]
      expect(writeDataCall).toBeDefined()
      if (!writeDataCall) return
      const [sunData, moonData] = writeDataCall

      // Verify each location has the expected data structure
      Object.keys(LOCATIONS).forEach(locationName => {
        expect(sunData[locationName]).toEqual(mockSunResponse)
        expect(moonData[locationName]).toEqual(mockMoonResponse)
      })
    })

    it('should process locations in the order they appear in LOCATIONS', async () => {
      await runJob()

      const fetchCalls = vi.mocked(fetchSunMoonData).mock.calls
      const locationKeys = Object.keys(LOCATIONS)

      locationKeys.forEach((key, index) => {
        expect(fetchCalls[index]?.[0]).toEqual(LOCATIONS[key as keyof typeof LOCATIONS])
      })
    })
  })

  describe('error handling', () => {
    it('should throw and log error when fetch fails for a location', async () => {
      const fetchError = new Error('API fetch failed')
      vi.mocked(fetchSunMoonData).mockRejectedValueOnce(fetchError)

      await expect(runJob()).rejects.toThrow('API fetch failed')

      expect(logError).toHaveBeenCalledTimes(1)
      expect(logError).toHaveBeenCalledWith(
        expect.anything(), // logger
        fetchError,
        'toronto' // First location in LOCATIONS
      )
    })

    it('should include current location name in error log when fetch fails', async () => {
      const fetchError = new Error('Network timeout')
      
      // Mock first location to succeed, second to fail
      vi.mocked(fetchSunMoonData)
        .mockResolvedValueOnce({ sun: mockSunResponse, moon: mockMoonResponse })
        .mockRejectedValueOnce(fetchError)

      await expect(runJob()).rejects.toThrow('Network timeout')

      const logErrorCall = vi.mocked(logError).mock.calls[0]
      expect(logErrorCall).toBeDefined()
      if (!logErrorCall) return
      expect(logErrorCall[2]).toBe('vancouver') // Second location in LOCATIONS
    })

    it('should throw error when writeData fails', async () => {
      const writeError = new Error('File system error')
      vi.mocked(writeData).mockRejectedValueOnce(writeError)

      await expect(runJob()).rejects.toThrow('File system error')

      expect(logError).toHaveBeenCalledTimes(1)
    })

    it('should log error without location when write fails', async () => {
      const writeError = new Error('Disk full')
      vi.mocked(writeData).mockRejectedValueOnce(writeError)

      await expect(runJob()).rejects.toThrow('Disk full')

      expect(logError).toHaveBeenCalledWith(
        expect.anything(),
        writeError,
        undefined // No location context for write errors
      )
    })

    it('should not call writeData if fetch fails', async () => {
      const fetchError = new Error('API error')
      vi.mocked(fetchSunMoonData).mockRejectedValueOnce(fetchError)

      await expect(runJob()).rejects.toThrow()

      expect(writeData).not.toHaveBeenCalled()
    })

    it('should not call logDataSaved if an error occurs', async () => {
      const fetchError = new Error('API error')
      vi.mocked(fetchSunMoonData).mockRejectedValueOnce(fetchError)

      await expect(runJob()).rejects.toThrow()

      expect(logDataSaved).not.toHaveBeenCalled()
    })

    it('should handle validation errors from fetchSunMoonData', async () => {
      const validationError = new Error('Invalid API response format: validation failed')
      vi.mocked(fetchSunMoonData).mockRejectedValueOnce(validationError)

      await expect(runJob()).rejects.toThrow('Invalid API response format')

      expect(logError).toHaveBeenCalledWith(
        expect.anything(),
        validationError,
        'toronto'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle null values in sun response', async () => {
      const sunWithNulls: SunResponse = {
        ...mockSunResponse,
        properties: {
          body: 'Sun',
          sunrise: null,
          sunset: null,
          solarnoon: null,
          solarmidnight: null
        }
      }

      vi.mocked(fetchSunMoonData).mockResolvedValue({
        sun: sunWithNulls,
        moon: mockMoonResponse
      })

      await runJob()

      expect(logLocationData).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(String),
        sunWithNulls,
        mockMoonResponse
      )

      const writeDataCall = vi.mocked(writeData).mock.calls[0]
      expect(writeDataCall).toBeDefined()
      if (!writeDataCall) return
      const [sunData] = writeDataCall

      Object.values(sunData).forEach(sun => {
        expect((sun as SunResponse).properties.sunrise).toBeNull()
        expect((sun as SunResponse).properties.sunset).toBeNull()
      })
    })

    it('should handle null values in moon response', async () => {
      const moonWithNulls: MoonResponse = {
        ...mockMoonResponse,
        properties: {
          body: 'Moon',
          moonrise: null,
          moonset: null,
          high_moon: null,
          low_moon: null,
          moonphase: null
        }
      }

      vi.mocked(fetchSunMoonData).mockResolvedValue({
        sun: mockSunResponse,
        moon: moonWithNulls
      })

      await runJob()

      expect(logLocationData).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(String),
        mockSunResponse,
        moonWithNulls
      )

      const writeDataCall = vi.mocked(writeData).mock.calls[0]
      expect(writeDataCall).toBeDefined()
      if (!writeDataCall) return
      const [, moonData] = writeDataCall

      Object.values(moonData).forEach(moon => {
        expect((moon as MoonResponse).properties.moonrise).toBeNull()
        expect((moon as MoonResponse).properties.moonset).toBeNull()
        expect((moon as MoonResponse).properties.moonphase).toBeNull()
      })
    })

    it('should handle different responses for different locations', async () => {
      const torontoResponse = { sun: mockSunResponse, moon: mockMoonResponse }
      const vancouverSun = { ...mockSunResponse, properties: { ...mockSunResponse.properties, sunrise: null } }
      const vancouverResponse = { sun: vancouverSun, moon: mockMoonResponse }

      vi.mocked(fetchSunMoonData)
        .mockResolvedValueOnce(torontoResponse)
        .mockResolvedValueOnce(vancouverResponse)

      await runJob()

      expect(fetchSunMoonData).toHaveBeenCalledTimes(Object.keys(LOCATIONS).length)

      const writeDataCall = vi.mocked(writeData).mock.calls[0]
      expect(writeDataCall).toBeDefined()
      if (!writeDataCall) return
      const [sunData] = writeDataCall

      expect(sunData.toronto?.properties.sunrise).toBeTruthy()
      expect(sunData.vancouver?.properties.sunrise).toBeNull()
    })

    it('should handle concurrent fetch operations correctly', async () => {
      // All locations should be fetched
      await runJob()

      expect(fetchSunMoonData).toHaveBeenCalledTimes(8) // 8 locations in LOCATIONS

      // Verify the order of calls
      const calls = vi.mocked(fetchSunMoonData).mock.calls
      expect(calls[0]?.[0]).toEqual(LOCATIONS.toronto)
      expect(calls[1]?.[0]).toEqual(LOCATIONS.vancouver)
      expect(calls[2]?.[0]).toEqual(LOCATIONS.kosiv)
      expect(calls[3]?.[0]).toEqual(LOCATIONS.montreal)
      expect(calls[4]?.[0]).toEqual(LOCATIONS.heidelberg)
      expect(calls[5]?.[0]).toEqual(LOCATIONS.bristol)
      expect(calls[6]?.[0]).toEqual(LOCATIONS.snowdonia)
      expect(calls[7]?.[0]).toEqual(LOCATIONS.sayulita)
    })

    it('should complete successfully even with all null sun/moon properties', async () => {
      const allNullsSun: SunResponse = {
        ...mockSunResponse,
        properties: {
          body: 'Sun',
          sunrise: null,
          sunset: null,
          solarnoon: null,
          solarmidnight: null
        }
      }

      const allNullsMoon: MoonResponse = {
        ...mockMoonResponse,
        properties: {
          body: 'Moon',
          moonrise: null,
          moonset: null,
          high_moon: null,
          low_moon: null,
          moonphase: null
        }
      }

      vi.mocked(fetchSunMoonData).mockResolvedValue({
        sun: allNullsSun,
        moon: allNullsMoon
      })

      await expect(runJob()).resolves.not.toThrow()

      expect(writeData).toHaveBeenCalledTimes(1)
      expect(logDataSaved).toHaveBeenCalledTimes(1)
    })
  })
})
