import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'

// Mock @workspace/utils to avoid jose module issues, but provide real delay implementation
vi.mock('@workspace/utils', () => ({
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  generateInternalJWT: vi.fn(),
  logError: vi.fn()
}))

// Import after mocking
const { readSunMoonData } = await import('../../../jobs/azimuth/read-data')

describe('readSunMoonData (integration)', () => {
  let originalCwd: string
  let tempDir: string
  let dataDir: string

  const mockSunData: Record<string, SunResponse> = {
    toronto: {
      copyright: 'MET Norway',
      licenseURL: 'https://api.met.no/license_data.html',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-79.347015, 43.651070]
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
    },
    vancouver: {
      copyright: 'MET Norway',
      licenseURL: 'https://api.met.no/license_data.html',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-123.1207, 49.2827]
      },
      when: {
        interval: ['2025-01-15T00:00:00Z', '2025-01-16T00:00:00Z']
      },
      properties: {
        body: 'Sun',
        sunrise: {
          time: '2025-01-15T08:03:00-08:00',
          azimuth: 118.7
        },
        sunset: {
          time: '2025-01-15T16:22:00-08:00',
          azimuth: 241.3
        },
        solarnoon: {
          time: '2025-01-15T12:12:00-08:00',
          disc_centre_elevation: 19.8,
          visible: true
        },
        solarmidnight: {
          time: '2025-01-15T00:12:00-08:00',
          disc_centre_elevation: -70.2,
          visible: false
        }
      }
    }
  }

  const mockMoonData: Record<string, MoonResponse> = {
    toronto: {
      copyright: 'MET Norway',
      licenseURL: 'https://api.met.no/license_data.html',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-79.347015, 43.651070]
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
    },
    vancouver: {
      copyright: 'MET Norway',
      licenseURL: 'https://api.met.no/license_data.html',
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-123.1207, 49.2827]
      },
      when: {
        interval: ['2025-01-15T00:00:00Z', '2025-01-16T00:00:00Z']
      },
      properties: {
        body: 'Moon',
        moonrise: {
          time: '2025-01-15T09:45:00-08:00',
          azimuth: 98.5
        },
        moonset: {
          time: '2025-01-15T18:32:00-08:00',
          azimuth: 261.5
        },
        high_moon: {
          time: '2025-01-15T14:08:00-08:00',
          disc_centre_elevation: 42.1,
          visible: true
        },
        low_moon: {
          time: '2025-01-15T02:08:00-08:00',
          disc_centre_elevation: -48.1,
          visible: false
        },
        moonphase: 0.45
      }
    }
  }

  beforeEach(async () => {
    // Save original cwd
    originalCwd = process.cwd()

    // Create temp directory structure inside crons/tmp (relative to test file: ../../../tmp)
    tempDir = path.join(import.meta.dirname, '../../../tmp', `read-data-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    
    // The function expects to find files at ../../packages/api/static/data/
    // So we need: tempDir/packages/crons/ (as fake cwd) and tempDir/packages/api/static/data/
    const cronDir = path.join(tempDir, 'packages', 'crons')
    dataDir = path.join(tempDir, 'packages', 'api', 'static', 'data')
    
    await fs.mkdir(cronDir, { recursive: true })
    await fs.mkdir(dataDir, { recursive: true })

    // Change to the fake crons directory so relative paths work
    process.chdir(cronDir)
  })

  afterEach(async () => {
    // Restore original cwd
    process.chdir(originalCwd)

    // Clean up temp directory
    if (fsSync.existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  })

  describe('successful file reading', () => {
    it('should read and parse real sun and moon data files from disk', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(result).toEqual({
        sunDataByLocation: mockSunData,
        moonDataByLocation: mockMoonData
      })
    })

    it('should handle multiple locations in real files', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(Object.keys(result.sunDataByLocation)).toHaveLength(2)
      expect(Object.keys(result.moonDataByLocation)).toHaveLength(2)
      expect(result.sunDataByLocation).toHaveProperty('toronto')
      expect(result.sunDataByLocation).toHaveProperty('vancouver')
    })

    it('should preserve all data properties from real files', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      const sunToronto = result.sunDataByLocation.toronto
      const moonToronto = result.moonDataByLocation.toronto

      expect(sunToronto).toBeDefined()
      expect(moonToronto).toBeDefined()
      expect(sunToronto?.copyright).toBe('MET Norway')
      expect(sunToronto?.properties.sunrise?.time).toBe('2025-01-15T07:30:00-05:00')
      expect(sunToronto?.properties.sunrise?.azimuth).toBe(120.5)
      expect(moonToronto?.properties.moonphase).toBe(0.5)
    })

    it('should handle empty data objects in real files', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), '{}', 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), '{}', 'utf8')

      const result = await readSunMoonData()

      expect(result).toEqual({
        sunDataByLocation: {},
        moonDataByLocation: {}
      })
    })

    it('should handle formatted JSON with whitespace', async () => {
      const formattedSun = JSON.stringify(mockSunData, null, 2)
      const formattedMoon = JSON.stringify(mockMoonData, null, 2)

      await fs.writeFile(path.join(dataDir, 'sun.json'), formattedSun, 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), formattedMoon, 'utf8')

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toHaveProperty('toronto')
      expect(result.moonDataByLocation).toHaveProperty('toronto')
    })
  })

  describe('file not found errors', () => {
    it('should throw error when sun file does not exist', async () => {
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')
      // Don't create sun.json

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }, 15000)

    it('should throw error when moon file does not exist', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      // Don't create moon.json

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }, 15000)

    it('should throw error when both files do not exist', async () => {
      // Don't create any files

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }, 15000)

    it('should throw error when data directory does not exist', async () => {
      // Don't create the data directory at all
      await fs.rm(dataDir, { recursive: true, force: true })

      await expect(readSunMoonData()).rejects.toThrow('Sun or moon data files not found. Waiting for sun-moon job to create them.')
    }, 15000)
  })

  describe('invalid JSON handling', () => {
    it('should throw error when sun file contains invalid JSON', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), 'invalid json{{{', 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      await expect(readSunMoonData()).rejects.toThrow()
    })

    it('should throw error when moon file contains invalid JSON', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), 'invalid json{{{', 'utf8')

      await expect(readSunMoonData()).rejects.toThrow()
    })

    it('should throw error when file contains malformed JSON', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), '{"incomplete": ', 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      await expect(readSunMoonData()).rejects.toThrow()
    })
  })

  describe('UTF-8 encoding', () => {
    it('should handle special characters in location names', async () => {
      const torontoSun = mockSunData.toronto
      const vancouverSun = mockSunData.vancouver
      const torontoMoon = mockMoonData.toronto
      const vancouverMoon = mockMoonData.vancouver

      if (!torontoSun || !vancouverSun || !torontoMoon || !vancouverMoon) {
        throw new Error('Required location data is undefined')
      }

      const specialSun: Record<string, SunResponse> = {
        'Montréal': torontoSun,
        'São Paulo': vancouverSun,
        'Zürich': torontoSun
      }

      const specialMoon: Record<string, MoonResponse> = {
        'Montréal': torontoMoon,
        'São Paulo': vancouverMoon,
        'Zürich': torontoMoon
      }

      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(specialSun, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(specialMoon, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toHaveProperty('Montréal')
      expect(result.sunDataByLocation).toHaveProperty('São Paulo')
      expect(result.sunDataByLocation).toHaveProperty('Zürich')
      expect(result.moonDataByLocation).toHaveProperty('Montréal')
      expect(result.moonDataByLocation).toHaveProperty('São Paulo')
    })

    it('should handle emoji and unicode characters', async () => {
      const torontoSun = mockSunData.toronto
      const torontoMoon = mockMoonData.toronto

      if (!torontoSun || !torontoMoon) {
        throw new Error('Toronto data is undefined')
      }

      const unicodeSun: Record<string, SunResponse> = {
        '东京': torontoSun,
        'Москва': torontoSun
      }

      const unicodeMoon: Record<string, MoonResponse> = {
        '东京': torontoMoon,
        'Москва': torontoMoon
      }

      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(unicodeSun, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(unicodeMoon, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toHaveProperty('东京')
      expect(result.sunDataByLocation).toHaveProperty('Москва')
    })
  })

  describe('edge cases', () => {
    it('should handle large data files', async () => {
      const torontoSun = mockSunData.toronto
      const torontoMoon = mockMoonData.toronto

      if (!torontoSun || !torontoMoon) {
        throw new Error('Toronto data is undefined')
      }

      const largeSun: Record<string, SunResponse> = {}
      const largeMoon: Record<string, MoonResponse> = {}

      for (let i = 0; i < 100; i++) {
        largeSun[`location${i}`] = torontoSun
        largeMoon[`location${i}`] = torontoMoon
      }

      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(largeSun, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(largeMoon, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(Object.keys(result.sunDataByLocation)).toHaveLength(100)
      expect(Object.keys(result.moonDataByLocation)).toHaveLength(100)
    })

    it('should handle data with null values', async () => {
      const torontoSun = mockSunData.toronto

      if (!torontoSun) {
        throw new Error('Toronto data is undefined')
      }

      const sunWithNulls: Record<string, SunResponse> = {
        location: {
          ...torontoSun,
          properties: {
            body: 'Sun',
            sunrise: null,
            sunset: null,
            solarnoon: null,
            solarmidnight: null
          }
        }
      }

      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(sunWithNulls, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      const location = result.sunDataByLocation.location
      expect(location).toBeDefined()
      expect(location?.properties.sunrise).toBeNull()
      expect(location?.properties.sunset).toBeNull()
    })

    it('should handle files written without formatting', async () => {
      const compactSun = JSON.stringify(mockSunData)
      const compactMoon = JSON.stringify(mockMoonData)

      await fs.writeFile(path.join(dataDir, 'sun.json'), compactSun, 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), compactMoon, 'utf8')

      const result = await readSunMoonData()

      expect(result.sunDataByLocation).toEqual(mockSunData)
      expect(result.moonDataByLocation).toEqual(mockMoonData)
    })
  })

  describe('file permissions', () => {
    it('should successfully read files with normal permissions', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(result).toBeDefined()
      expect(result.sunDataByLocation).toBeDefined()
      expect(result.moonDataByLocation).toBeDefined()
    })
  })

  describe('path resolution', () => {
    it('should correctly resolve relative paths from cwd', async () => {
      await fs.writeFile(path.join(dataDir, 'sun.json'), JSON.stringify(mockSunData, null, 2), 'utf8')
      await fs.writeFile(path.join(dataDir, 'moon.json'), JSON.stringify(mockMoonData, null, 2), 'utf8')

      const result = await readSunMoonData()

      expect(result).toBeDefined()
      // If path resolution failed, we wouldn't get here
      expect(result.sunDataByLocation).toEqual(mockSunData)
      expect(result.moonDataByLocation).toEqual(mockMoonData)
    })
  })
})
