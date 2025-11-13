import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { writeData } from '../../../jobs/sun-moon/write-data'
import * as fs from 'fs/promises'
import * as path from 'path'
import { existsSync } from 'fs'

describe('writeData (integration)', () => {
  let tempDir: string

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
        interval: ['2025-01-01', '2025-01-02']
      },
      properties: {
        body: 'Sun',
        sunrise: {
          time: '2025-01-01T08:03:00-08:00',
          azimuth: 118.7
        },
        sunset: {
          time: '2025-01-01T16:22:00-08:00',
          azimuth: 241.3
        },
        solarnoon: {
          time: '2025-01-01T12:12:00-08:00',
          disc_centre_elevation: 19.8,
          visible: true
        },
        solarmidnight: {
          time: '2025-01-01T00:12:00-08:00',
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
        interval: ['2025-01-01', '2025-01-02']
      },
      properties: {
        body: 'Moon',
        moonrise: {
          time: '2025-01-01T09:45:00-08:00',
          azimuth: 98.5
        },
        moonset: {
          time: '2025-01-01T18:32:00-08:00',
          azimuth: 261.5
        },
        high_moon: {
          time: '2025-01-01T14:08:00-08:00',
          disc_centre_elevation: 42.1,
          visible: true
        },
        low_moon: {
          time: '2025-01-01T02:08:00-08:00',
          disc_centre_elevation: -48.1,
          visible: false
        },
        moonphase: 0.45
      }
    }
  }

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    tempDir = path.join(process.cwd(), '.test-temp', `test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  })

  afterEach(async () => {
    // Clean up the temporary directory after each test
    if (existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true })
    }
  })

  describe('file system operations', () => {
    it('should create directory and write files to disk', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(existsSync(tempDir)).toBe(true)
      expect(existsSync(path.join(tempDir, 'sun.json'))).toBe(true)
      expect(existsSync(path.join(tempDir, 'moon.json'))).toBe(true)
    })

    it('should create nested directories', async () => {
      const nestedDir = path.join(tempDir, 'deep', 'nested', 'path')
      const outputDir = path.relative(process.cwd(), nestedDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(existsSync(nestedDir)).toBe(true)
      expect(existsSync(path.join(nestedDir, 'sun.json'))).toBe(true)
      expect(existsSync(path.join(nestedDir, 'moon.json'))).toBe(true)
    })

    it('should work with existing directory', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      await fs.mkdir(tempDir, { recursive: true })

      await writeData(mockSunData, mockMoonData, outputDir)

      expect(existsSync(path.join(tempDir, 'sun.json'))).toBe(true)
      expect(existsSync(path.join(tempDir, 'moon.json'))).toBe(true)
    })
  })

  describe('file content validation', () => {
    it('should write valid JSON to sun.json', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const parsed = JSON.parse(sunContent)

      expect(parsed).toEqual(mockSunData)
    })

    it('should write valid JSON to moon.json', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      const parsed = JSON.parse(moonContent)

      expect(parsed).toEqual(mockMoonData)
    })

    it('should format JSON with proper indentation', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')

      // Check that JSON is formatted (has newlines and indentation)
      expect(sunContent).toContain('\n')
      expect(sunContent).toContain('  ')
      expect(moonContent).toContain('\n')
      expect(moonContent).toContain('  ')
    })

    it('should preserve all location data', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      const parsedSun = JSON.parse(sunContent)
      const parsedMoon = JSON.parse(moonContent)

      expect(Object.keys(parsedSun)).toHaveLength(2)
      expect(parsedSun).toHaveProperty('toronto')
      expect(parsedSun).toHaveProperty('vancouver')
      expect(Object.keys(parsedMoon)).toHaveLength(2)
      expect(parsedMoon).toHaveProperty('toronto')
      expect(parsedMoon).toHaveProperty('vancouver')
    })

    it('should preserve data types and structure', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const parsedSun = JSON.parse(sunContent)

      expect(typeof parsedSun.toronto.properties.sunrise.azimuth).toBe('number')
      expect(typeof parsedSun.toronto.properties.sunrise.time).toBe('string')
      expect(parsedSun.toronto.geometry.coordinates).toBeInstanceOf(Array)
    })
  })

  describe('overwriting existing files', () => {
    it('should overwrite existing sun.json', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      await fs.mkdir(tempDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, 'sun.json'), 'old content', 'utf8')

      await writeData(mockSunData, mockMoonData, outputDir)

      const content = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      expect(content).not.toBe('old content')
      expect(JSON.parse(content)).toEqual(mockSunData)
    })

    it('should overwrite existing moon.json', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      await fs.mkdir(tempDir, { recursive: true })
      await fs.writeFile(path.join(tempDir, 'moon.json'), 'old content', 'utf8')

      await writeData(mockSunData, mockMoonData, outputDir)

      const content = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      expect(content).not.toBe('old content')
      expect(JSON.parse(content)).toEqual(mockMoonData)
    })

    it('should update files with new data', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      // First write
      await writeData(mockSunData, mockMoonData, outputDir)
      const firstSunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')

      // Second write with modified data
      const torontoSun = mockSunData.toronto

      if (!torontoSun) {
        throw new Error('Toronto sun data is undefined')
      }

      const modifiedSunData: Record<string, SunResponse> = {
        ...mockSunData,
        montreal: torontoSun
      }
      await writeData(modifiedSunData, mockMoonData, outputDir)
      const secondSunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')

      expect(firstSunContent).not.toBe(secondSunContent)
      expect(JSON.parse(secondSunContent)).toHaveProperty('montreal')
    })
  })

  describe('empty data handling', () => {
    it('should write empty object when sun data is empty', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const emptySun: Record<string, SunResponse> = {}
      
      await writeData(emptySun, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      expect(JSON.parse(sunContent)).toEqual({})
    })

    it('should write empty object when moon data is empty', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const emptyMoon: Record<string, MoonResponse> = {}
      
      await writeData(mockSunData, emptyMoon, outputDir)

      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      expect(JSON.parse(moonContent)).toEqual({})
    })

    it('should create files even with empty data', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const emptySun: Record<string, SunResponse> = {}
      const emptyMoon: Record<string, MoonResponse> = {}
      
      await writeData(emptySun, emptyMoon, outputDir)

      expect(existsSync(path.join(tempDir, 'sun.json'))).toBe(true)
      expect(existsSync(path.join(tempDir, 'moon.json'))).toBe(true)
    })
  })

  describe('null values in data', () => {
    it('should preserve null values in sun properties', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const torontoSun = mockSunData.toronto

      if (!torontoSun) {
        throw new Error('Toronto sun data is undefined')
      }

      const sunWithNulls: Record<string, SunResponse> = {
        toronto: {
          copyright: torontoSun.copyright,
          licenseURL: torontoSun.licenseURL,
          type: torontoSun.type,
          geometry: torontoSun.geometry,
          when: torontoSun.when,
          properties: {
            body: 'Sun',
            sunrise: null,
            sunset: null,
            solarnoon: null,
            solarmidnight: null
          }
        }
      }

      await writeData(sunWithNulls, mockMoonData, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const parsed = JSON.parse(sunContent)

      expect(parsed.toronto.properties.sunrise).toBeNull()
      expect(parsed.toronto.properties.sunset).toBeNull()
      expect(parsed.toronto.properties.solarnoon).toBeNull()
    })

    it('should preserve null values in moon properties', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const torontoMoon = mockMoonData.toronto

      if (!torontoMoon) {
        throw new Error('Toronto moon data is undefined')
      }

      const moonWithNulls: Record<string, MoonResponse> = {
        toronto: {
          copyright: torontoMoon.copyright,
          licenseURL: torontoMoon.licenseURL,
          type: torontoMoon.type,
          geometry: torontoMoon.geometry,
          when: torontoMoon.when,
          properties: {
            body: 'Moon',
            moonrise: null,
            moonset: null,
            high_moon: null,
            low_moon: null,
            moonphase: null
          }
        }
      }

      await writeData(mockSunData, moonWithNulls, outputDir)

      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      const parsed = JSON.parse(moonContent)

      expect(parsed.toronto.properties.moonrise).toBeNull()
      expect(parsed.toronto.properties.moonset).toBeNull()
      expect(parsed.toronto.properties.moonphase).toBeNull()
    })
  })

  describe('UTF-8 encoding', () => {
    it('should handle special characters in location names', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const torontoSun = mockSunData.toronto
      const vancouverSun = mockSunData.vancouver
      const torontoMoon = mockMoonData.toronto
      const vancouverMoon = mockMoonData.vancouver

      if (!torontoSun || !vancouverSun || !torontoMoon || !vancouverMoon) {
        throw new Error('Required location data is undefined')
      }

      const specialSun: Record<string, SunResponse> = {
        'Montréal': torontoSun,
        'São Paulo': vancouverSun
      }
      const specialMoon: Record<string, MoonResponse> = {
        'Montréal': torontoMoon,
        'São Paulo': vancouverMoon
      }

      await writeData(specialSun, specialMoon, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      const parsedSun = JSON.parse(sunContent)
      const parsedMoon = JSON.parse(moonContent)

      expect(parsedSun).toHaveProperty('Montréal')
      expect(parsedSun).toHaveProperty('São Paulo')
      expect(parsedMoon).toHaveProperty('Montréal')
      expect(parsedMoon).toHaveProperty('São Paulo')
    })
  })

  describe('large datasets', () => {
    it('should handle many locations', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      const manySun: Record<string, SunResponse> = {}
      const manyMoon: Record<string, MoonResponse> = {}

      const torontoSun = mockSunData.toronto
      const torontoMoon = mockMoonData.toronto

      if (!torontoSun || !torontoMoon) {
        throw new Error('Toronto data is undefined')
      }

      // Create 20 locations
      for (let i = 0; i < 20; i++) {
        manySun[`location${i}`] = torontoSun
        manyMoon[`location${i}`] = torontoMoon
      }

      await writeData(manySun, manyMoon, outputDir)

      const sunContent = await fs.readFile(path.join(tempDir, 'sun.json'), 'utf8')
      const moonContent = await fs.readFile(path.join(tempDir, 'moon.json'), 'utf8')
      const parsedSun = JSON.parse(sunContent)
      const parsedMoon = JSON.parse(moonContent)

      expect(Object.keys(parsedSun)).toHaveLength(20)
      expect(Object.keys(parsedMoon)).toHaveLength(20)
    })
  })

  describe('file permissions', () => {
    it('should create readable files', async () => {
      const outputDir = path.relative(process.cwd(), tempDir)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunPath = path.join(tempDir, 'sun.json')
      const moonPath = path.join(tempDir, 'moon.json')

      // Should be able to read the files
      await expect(fs.readFile(sunPath, 'utf8')).resolves.toBeTruthy()
      await expect(fs.readFile(moonPath, 'utf8')).resolves.toBeTruthy()
    })
  })
})
