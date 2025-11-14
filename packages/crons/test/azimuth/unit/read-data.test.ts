import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'

// Setup mocks before imports
const mockExistsSync = vi.fn()
const mockReadFileSync = vi.fn()
const mockDelay = vi.fn()

vi.mock('fs', () => ({
  default: {
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync
  }
}))

vi.mock('@workspace/utils', () => ({
  delay: mockDelay
}))

// Import after mocking
const { readSunMoonData } = await import('../../../jobs/azimuth/read-data')
const path = await import('path')

describe('readSunMoonData', () => {
  const mockSunData: Record<string, SunResponse> = {
    'toronto': {
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
      }
    }
  }

  const mockMoonData: Record<string, MoonResponse> = {
    'toronto': {
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
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDelay.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('successful file reading', () => {
    it('should read and parse sun and moon data files successfully', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result).toEqual({
        sunDataByLocation: mockSunData,
        moonDataByLocation: mockMoonData
      })
      expect(mockExistsSync).toHaveBeenCalledTimes(2)
      expect(mockReadFileSync).toHaveBeenCalledTimes(2)
    })

    it('should read files from correct paths', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      await readSunMoonData()

      const expectedSunPath = path.default.join(process.cwd(), '../../packages/api/static/data/sun.json')
      const expectedMoonPath = path.default.join(process.cwd(), '../../packages/api/static/data/moon.json')

      expect(mockReadFileSync).toHaveBeenCalledWith(expectedSunPath, 'utf8')
      expect(mockReadFileSync).toHaveBeenCalledWith(expectedMoonPath, 'utf8')
    })

    it('should handle multiple locations in data files', async () => {
      const multiLocationSunData = {
        'toronto': mockSunData.toronto,
        'vancouver': mockSunData.toronto,
        'montreal': mockSunData.toronto
      }
      const multiLocationMoonData = {
        'toronto': mockMoonData.toronto,
        'vancouver': mockMoonData.toronto,
        'montreal': mockMoonData.toronto
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(multiLocationSunData))
        .mockReturnValueOnce(JSON.stringify(multiLocationMoonData))

      const result = await readSunMoonData()

      expect(Object.keys(result.sunDataByLocation)).toHaveLength(3)
      expect(Object.keys(result.moonDataByLocation)).toHaveLength(3)
      expect(result.sunDataByLocation).toHaveProperty('toronto')
      expect(result.sunDataByLocation).toHaveProperty('vancouver')
      expect(result.sunDataByLocation).toHaveProperty('montreal')
    })

    it('should handle empty data objects', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify({}))
        .mockReturnValueOnce(JSON.stringify({}))

      const result = await readSunMoonData()

      expect(result).toEqual({
        sunDataByLocation: {},
        moonDataByLocation: {}
      })
    })

    it('should preserve all data properties', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result.sunDataByLocation.toronto).toBeDefined()
      expect(result.moonDataByLocation.toronto).toBeDefined()
      const sunToronto = result.sunDataByLocation.toronto
      const moonToronto = result.moonDataByLocation.toronto
      expect(sunToronto?.copyright).toBe('MET Norway')
      expect(sunToronto?.properties.sunrise?.time).toBe('2025-01-15T07:30:00-05:00')
      expect(moonToronto?.properties.moonphase).toBe(0.5)
    })
  })

  describe('file not found errors', () => {
    it('should delay and throw error when sun file does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })

    it('should delay and throw error when moon file does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })

    it('should delay and throw error when both files do not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })

    it('should check file existence with short-circuit evaluation', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow()
      // Due to OR short-circuit, only first file is checked when it returns false
      expect(mockExistsSync).toHaveBeenCalledTimes(1)
    })
  })

  describe('ENOENT error handling', () => {
    it('should delay and throw error when readFileSync throws ENOENT for sun file', async () => {
      mockExistsSync.mockReturnValue(true)
      const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException
      enoentError.code = 'ENOENT'
      mockReadFileSync.mockImplementation(() => {
        throw enoentError
      })

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })

    it('should delay and throw error when readFileSync throws ENOENT for moon file', async () => {
      mockExistsSync.mockReturnValue(true)
      const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException
      enoentError.code = 'ENOENT'
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockImplementation(() => {
          throw enoentError
        })

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
    })

    it('should handle ENOENT error with different error message', async () => {
      mockExistsSync.mockReturnValue(true)
      const enoentError = new Error('File not found') as NodeJS.ErrnoException
      enoentError.code = 'ENOENT'
      mockReadFileSync.mockImplementation(() => {
        throw enoentError
      })

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
      expect(mockDelay).toHaveBeenCalledWith(10000)
    })
  })

  describe('other error handling', () => {
    it('should throw original error when JSON parsing fails', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('invalid json{{{')

      await expect(readSunMoonData()).rejects.toThrow()
      expect(mockDelay).not.toHaveBeenCalled()
    })

    it('should throw original error for permission denied', async () => {
      mockExistsSync.mockReturnValue(true)
      const permissionError = new Error('EACCES: permission denied') as NodeJS.ErrnoException
      permissionError.code = 'EACCES'
      mockReadFileSync.mockImplementation(() => {
        throw permissionError
      })

      await expect(readSunMoonData()).rejects.toThrow('EACCES: permission denied')
      expect(mockDelay).not.toHaveBeenCalled()
    })

    it('should throw original error for generic read errors', async () => {
      mockExistsSync.mockReturnValue(true)
      const genericError = new Error('Unknown read error')
      mockReadFileSync.mockImplementation(() => {
        throw genericError
      })

      await expect(readSunMoonData()).rejects.toThrow('Unknown read error')
      expect(mockDelay).not.toHaveBeenCalled()
    })

    it('should not delay when error is not ENOENT', async () => {
      mockExistsSync.mockReturnValue(true)
      const otherError = new Error('Some other error') as NodeJS.ErrnoException
      otherError.code = 'EISDIR'
      mockReadFileSync.mockImplementation(() => {
        throw otherError
      })

      await expect(readSunMoonData()).rejects.toThrow('Some other error')
      expect(mockDelay).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle very large data files', async () => {
      const torontoData = mockSunData.toronto
      if (!torontoData) throw new Error('Toronto data is undefined')
      const largeData: Record<string, SunResponse> = {}
      for (let i = 0; i < 1000; i++) {
        largeData[`location${i}`] = torontoData
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(largeData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(Object.keys(result.sunDataByLocation)).toHaveLength(1000)
    })

    it('should handle data with special characters in location names', async () => {
      const torontoData = mockSunData.toronto
      if (!torontoData) throw new Error('Toronto data is undefined')
      const specialData = {
        'São Paulo': torontoData,
        'Montréal': torontoData,
        'Zürich': torontoData
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(specialData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toHaveProperty('São Paulo')
      expect(result.sunDataByLocation).toHaveProperty('Montréal')
      expect(result.sunDataByLocation).toHaveProperty('Zürich')
    })

    it('should handle data with nested null values', async () => {
      const torontoData = mockSunData.toronto
      if (!torontoData) throw new Error('Toronto data is undefined')
      const dataWithNulls = {
        'location': {
          ...torontoData,
          properties: {
            body: 'Sun',
            sunrise: null,
            sunset: null,
            solarnoon: null,
            solarmidnight: null
          }
        }
      }

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(dataWithNulls))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result.sunDataByLocation.location).toBeDefined()
      const location = result.sunDataByLocation.location
      expect(location?.properties.sunrise).toBeNull()
      expect(location?.properties.sunset).toBeNull()
    })

    it('should handle JSON with whitespace and formatting', async () => {
      const torontoData = mockSunData.toronto
      if (!torontoData) throw new Error('Toronto data is undefined')
      const formattedJson = `
        {
          "toronto": ${JSON.stringify(torontoData, null, 2)}
        }
      `

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(formattedJson)
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toHaveProperty('toronto')
    })

    it('should throw error when JSON contains BOM (Byte Order Mark)', async () => {
      const bomData = '\uFEFF' + JSON.stringify(mockSunData)

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(bomData)
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      await expect(readSunMoonData()).rejects.toThrow()
      expect(mockDelay).not.toHaveBeenCalled()
    })
  })

  describe('path construction', () => {
    it('should construct relative paths from current working directory', async () => {
      const originalCwd = process.cwd()
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      await readSunMoonData()

      const expectedSunPath = path.default.join(originalCwd, '../../packages/api/static/data/sun.json')
      const expectedMoonPath = path.default.join(originalCwd, '../../packages/api/static/data/moon.json')

      expect(mockReadFileSync).toHaveBeenCalledWith(expectedSunPath, 'utf8')
      expect(mockReadFileSync).toHaveBeenCalledWith(expectedMoonPath, 'utf8')
    })

    it('should use utf8 encoding when reading files', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      await readSunMoonData()

      const calls = mockReadFileSync.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2)
      expect(calls[0]?.[1]).toBe('utf8')
      expect(calls[1]?.[1]).toBe('utf8')
    })
  })

  describe('return type validation', () => {
    it('should return object with correct structure', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result).toHaveProperty('sunDataByLocation')
      expect(result).toHaveProperty('moonDataByLocation')
      expect(typeof result.sunDataByLocation).toBe('object')
      expect(typeof result.moonDataByLocation).toBe('object')
    })

    it('should return data that matches expected types', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync
        .mockReturnValueOnce(JSON.stringify(mockSunData))
        .mockReturnValueOnce(JSON.stringify(mockMoonData))

      const result = await readSunMoonData()

      expect(result.sunDataByLocation.toronto).toBeDefined()
      expect(result.moonDataByLocation.toronto).toBeDefined()
      const sunToronto = result.sunDataByLocation.toronto
      const moonToronto = result.moonDataByLocation.toronto
      expect(sunToronto?.type).toBe('Feature')
      expect(sunToronto?.properties.body).toBe('Sun')
      expect(moonToronto?.properties.body).toBe('Moon')
    })
  })

  describe('delay behavior', () => {
    it('should call delay with exactly 10000ms for file not found', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow()
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })

    it('should call delay with exactly 10000ms for ENOENT error', async () => {
      mockExistsSync.mockReturnValue(true)
      const enoentError = new Error('ENOENT') as NodeJS.ErrnoException
      enoentError.code = 'ENOENT'
      mockReadFileSync.mockImplementation(() => {
        throw enoentError
      })

      await expect(readSunMoonData()).rejects.toThrow()
      expect(mockDelay).toHaveBeenCalledWith(10000)
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })

    it('should not call delay multiple times', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(readSunMoonData()).rejects.toThrow()
      expect(mockDelay).toHaveBeenCalledTimes(1)
    })
  })
})
