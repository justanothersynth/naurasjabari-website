import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { format } from 'date-fns'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { fetchSunMoonData } from '../../../jobs/sun-moon/fetch-data'

describe('fetchSunMoonData', () => {
  const mockLocation = {
    lat: 43.651070,
    lon: -79.347015,
    offset: '-05:00'
  }

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

  const mockFetch = vi.fn()

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('successful API calls', () => {
    it('should fetch sun and moon data successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMoonResponse
        })

      const result = await fetchSunMoonData(mockLocation)

      expect(result).toEqual({
        sun: mockSunResponse,
        moon: mockMoonResponse
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should call API with correct URL parameters', async () => {
      const date = format(new Date(Date.now()), 'yyyy-MM-dd')
      const expectedParams = `lat=${mockLocation.lat}&lon=${mockLocation.lon}&date=${date}&offset=${mockLocation.offset}`

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMoonResponse
        })

      await fetchSunMoonData(mockLocation)

      expect(mockFetch).toHaveBeenNthCalledWith(1, `https://api.met.no/weatherapi/sunrise/3.0/sun?${expectedParams}`)
      expect(mockFetch).toHaveBeenNthCalledWith(2, `https://api.met.no/weatherapi/sunrise/3.0/moon?${expectedParams}`)
    })

    it('should handle locations with different coordinates', async () => {
      const vancouverLocation = {
        lat: 49.2827,
        lon: -123.1207,
        offset: '-08:00'
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMoonResponse
        })

      const result = await fetchSunMoonData(vancouverLocation)

      expect(result).toHaveProperty('sun')
      expect(result).toHaveProperty('moon')
      expect(mockFetch).toHaveBeenCalledTimes(2)
      const firstCall = mockFetch.mock.calls[0] as [string]
      expect(firstCall[0]).toContain(`lat=${vancouverLocation.lat}`)
      expect(firstCall[0]).toContain(`lon=${vancouverLocation.lon}`)
    })
  })

  describe('HTTP error handling', () => {
    it('should throw error when sun API returns non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Met.no sun API error: 404 Not Found')
    })

    it('should throw error when moon API returns non-ok status', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Met.no moon API error: 500 Internal Server Error')
    })

    it('should throw error when sun API returns 429 (rate limit)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Met.no sun API error: 429 Too Many Requests')
    })
  })

  describe('validation error handling', () => {
    it('should throw error when sun response has invalid format', async () => {
      const invalidSunResponse = {
        ...mockSunResponse,
        type: 'InvalidType' // Should be 'Feature'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidSunResponse
      })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Invalid API response format')
    })

    it('should throw error when moon response has invalid format', async () => {
      const invalidMoonResponse = {
        ...mockMoonResponse,
        properties: {
          ...mockMoonResponse.properties,
          body: 'InvalidBody' // Should be 'Moon'
        }
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => invalidMoonResponse
        })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Invalid API response format')
    })

    it('should throw error when sun response is missing required fields', async () => {
      const incompleteSunResponse = {
        copyright: 'MET Norway',
        licenseURL: 'https://api.met.no/license_data.html'
        // Missing type, geometry, when, properties
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteSunResponse
      })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Invalid API response format')
    })

    it('should throw error when moon response is missing required fields', async () => {
      const incompleteMoonResponse = {
        type: 'Feature'
        // Missing other required fields
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => incompleteMoonResponse
        })

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Invalid API response format')
    })
  })

  describe('network error handling', () => {
    it('should throw error when fetch fails with network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Network error')
    })

    it('should throw error when sun API times out', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Request timeout')
    })

    it('should throw error when moon API fails after successful sun call', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSunResponse
        })
        .mockRejectedValueOnce(new Error('Connection refused'))

      await expect(fetchSunMoonData(mockLocation))
        .rejects
        .toThrow('Connection refused')
    })
  })

  describe('edge cases', () => {
    it('should handle null values in sun and moon properties', async () => {
      const sunResponseWithNulls: SunResponse = {
        ...mockSunResponse,
        properties: {
          body: 'Sun',
          sunrise: null,
          sunset: null,
          solarnoon: null,
          solarmidnight: null
        }
      }

      const moonResponseWithNulls: MoonResponse = {
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

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => sunResponseWithNulls
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => moonResponseWithNulls
        })

      const result = await fetchSunMoonData(mockLocation)

      expect(result.sun.properties.sunrise).toBeNull()
      expect(result.moon.properties.moonrise).toBeNull()
    })

    it('should handle polar night scenario (no sun)', async () => {
      const polarNightSun: SunResponse = {
        ...mockSunResponse,
        properties: {
          body: 'Sun',
          sunrise: null,
          sunset: null,
          solarnoon: {
            time: '2025-01-01T12:00:00-05:00',
            disc_centre_elevation: -5.5,
            visible: false
          },
          solarmidnight: null
        }
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => polarNightSun
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMoonResponse
        })

      const result = await fetchSunMoonData(mockLocation)

      expect(result.sun.properties.sunrise).toBeNull()
      expect(result.sun.properties.sunset).toBeNull()
      expect(result.sun.properties.solarnoon?.visible).toBe(false)
    })

    it('should handle midnight sun scenario (sun never sets)', async () => {
      const midnightSun: SunResponse = {
        ...mockSunResponse,
        properties: {
          body: 'Sun',
          sunrise: null,
          sunset: null,
          solarnoon: {
            time: '2025-06-21T12:00:00-05:00',
            disc_centre_elevation: 66.5,
            visible: true
          },
          solarmidnight: {
            time: '2025-06-21T00:00:00-05:00',
            disc_centre_elevation: 10.5,
            visible: true
          }
        }
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => midnightSun
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMoonResponse
        })

      const result = await fetchSunMoonData(mockLocation)

      expect(result.sun.properties.sunrise).toBeNull()
      expect(result.sun.properties.sunset).toBeNull()
      expect(result.sun.properties.solarmidnight?.visible).toBe(true)
    })
  })
})
