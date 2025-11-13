import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SunResponse, MoonResponse } from '@workspace/types'
import { writeData } from '../../../jobs/sun-moon/write-data'
import * as fs from 'fs/promises'
import * as path from 'path'

vi.mock('fs/promises')

describe('writeData (unit)', () => {
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
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('directory creation', () => {
    it('should create output directory with recursive option', async () => {
      const outputDir = 'api/static/data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.mkdir).toHaveBeenCalledTimes(1)
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), outputDir),
        { recursive: true }
      )
    })

    it('should create nested directory paths', async () => {
      const outputDir = 'deep/nested/path/to/data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), outputDir),
        { recursive: true }
      )
    })

    it('should handle directory that already exists', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined)
      
      await writeData(mockSunData, mockMoonData, 'existing/dir')

      expect(fs.mkdir).toHaveBeenCalledTimes(1)
    })
  })

  describe('file writing', () => {
    it('should write sun and moon data to separate files', async () => {
      const outputDir = 'api/static/data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.writeFile).toHaveBeenCalledTimes(2)
    })

    it('should write sun data with correct path and content', async () => {
      const outputDir = 'api/static/data'
      const expectedPath = path.join(process.cwd(), outputDir, 'sun.json')
      const expectedContent = JSON.stringify(mockSunData, null, 2)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        expectedContent,
        'utf8'
      )
    })

    it('should write moon data with correct path and content', async () => {
      const outputDir = 'api/static/data'
      const expectedPath = path.join(process.cwd(), outputDir, 'moon.json')
      const expectedContent = JSON.stringify(mockMoonData, null, 2)
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        expectedContent,
        'utf8'
      )
    })

    it('should format JSON with 2-space indentation', async () => {
      const outputDir = 'api/static/data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const sunCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('sun.json')
      )
      const moonCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('moon.json')
      )

      expect(sunCall?.[1]).toContain('  ')
      expect(moonCall?.[1]).toContain('  ')
    })

    it('should write files in UTF-8 encoding', async () => {
      const outputDir = 'api/static/data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      const calls = vi.mocked(fs.writeFile).mock.calls
      expect(calls).toHaveLength(2)
      expect(calls[0]?.[2]).toBe('utf8')
      expect(calls[1]?.[2]).toBe('utf8')
    })
  })

  describe('multiple locations', () => {
    it('should handle multiple locations in sun and moon data', async () => {
      const torontoSun = mockSunData.toronto
      const torontoMoon = mockMoonData.toronto

      if (!torontoSun || !torontoMoon) {
        throw new Error('Toronto data is undefined')
      }

      const multiLocationSun: Record<string, SunResponse> = {
        toronto: torontoSun,
        vancouver: {
          copyright: torontoSun.copyright,
          licenseURL: torontoSun.licenseURL,
          type: torontoSun.type,
          when: torontoSun.when,
          geometry: { type: 'Point', coordinates: [-123.1207, 49.2827] },
          properties: torontoSun.properties
        }
      }
      const multiLocationMoon: Record<string, MoonResponse> = {
        toronto: torontoMoon,
        vancouver: {
          copyright: torontoMoon.copyright,
          licenseURL: torontoMoon.licenseURL,
          type: torontoMoon.type,
          when: torontoMoon.when,
          geometry: { type: 'Point', coordinates: [-123.1207, 49.2827] },
          properties: torontoMoon.properties
        }
      }

      await writeData(multiLocationSun, multiLocationMoon, 'api/static/data')

      const sunCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('sun.json')
      )
      expect(sunCall).toBeDefined()
      const sunContent = sunCall?.[1] as string
      const parsedSun = JSON.parse(sunContent)

      expect(Object.keys(parsedSun)).toHaveLength(2)
      expect(parsedSun).toHaveProperty('toronto')
      expect(parsedSun).toHaveProperty('vancouver')
    })

    it('should preserve all location data in output', async () => {
      const locations = ['toronto', 'vancouver', 'montreal', 'heidelberg']
      const multipleSun: Record<string, SunResponse> = {}
      const multipleMoon: Record<string, MoonResponse> = {}

      const torontoSun = mockSunData.toronto
      const torontoMoon = mockMoonData.toronto

      if (!torontoSun || !torontoMoon) {
        throw new Error('Toronto data is undefined')
      }

      locations.forEach(loc => {
        multipleSun[loc] = torontoSun
        multipleMoon[loc] = torontoMoon
      })

      await writeData(multipleSun, multipleMoon, 'api/static/data')

      const sunCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('sun.json')
      )
      expect(sunCall).toBeDefined()
      const sunContent = sunCall?.[1] as string
      const parsedSun = JSON.parse(sunContent)

      expect(Object.keys(parsedSun)).toHaveLength(4)
      locations.forEach(loc => {
        expect(parsedSun).toHaveProperty(loc)
      })
    })
  })

  describe('empty data', () => {
    it('should handle empty sun data object', async () => {
      const emptySun: Record<string, SunResponse> = {}

      await writeData(emptySun, mockMoonData, 'api/static/data')

      const sunCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('sun.json')
      )
      expect(sunCall).toBeDefined()
      const sunContent = sunCall?.[1] as string
      expect(JSON.parse(sunContent)).toEqual({})
    })

    it('should handle empty moon data object', async () => {
      const emptyMoon: Record<string, MoonResponse> = {}

      await writeData(mockSunData, emptyMoon, 'api/static/data')

      const moonCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('moon.json')
      )
      expect(moonCall).toBeDefined()
      const moonContent = moonCall?.[1] as string
      expect(JSON.parse(moonContent)).toEqual({})
    })

    it('should handle both empty data objects', async () => {
      const emptySun: Record<string, SunResponse> = {}
      const emptyMoon: Record<string, MoonResponse> = {}
      
      await writeData(emptySun, emptyMoon, 'api/static/data')

      expect(fs.writeFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should propagate error when directory creation fails', async () => {
      const error = new Error('Permission denied')
      vi.mocked(fs.mkdir).mockRejectedValue(error)

      await expect(
        writeData(mockSunData, mockMoonData, 'api/static/data')
      ).rejects.toThrow('Permission denied')
    })

    it('should propagate error when sun file write fails', async () => {
      const error = new Error('Disk full')
      vi.mocked(fs.writeFile).mockRejectedValueOnce(error)

      await expect(
        writeData(mockSunData, mockMoonData, 'api/static/data')
      ).rejects.toThrow('Disk full')
    })

    it('should propagate error when moon file write fails', async () => {
      const error = new Error('Write error')
      vi.mocked(fs.writeFile)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(error)

      await expect(
        writeData(mockSunData, mockMoonData, 'api/static/data')
      ).rejects.toThrow('Write error')
    })

    it('should not write files if directory creation fails', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Failed'))

      await expect(
        writeData(mockSunData, mockMoonData, 'api/static/data')
      ).rejects.toThrow()

      expect(fs.writeFile).not.toHaveBeenCalled()
    })
  })

  describe('path handling', () => {
    it('should handle relative paths correctly', async () => {
      const outputDir = 'relative/path'

      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), outputDir),
        { recursive: true }
      )
    })

    it('should handle paths with trailing slashes', async () => {
      const outputDir = 'api/static/data/'

      await writeData(mockSunData, mockMoonData, outputDir)

      const expectedDir = path.join(process.cwd(), outputDir)
      expect(fs.mkdir).toHaveBeenCalledWith(expectedDir, { recursive: true })
    })

    it('should handle single directory names', async () => {
      const outputDir = 'data'
      
      await writeData(mockSunData, mockMoonData, outputDir)

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), outputDir),
        { recursive: true }
      )
    })
  })

  describe('data with null values', () => {
    it('should preserve null values in sun data', async () => {
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

      await writeData(sunWithNulls, mockMoonData, 'api/static/data')

      const sunCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('sun.json')
      )
      expect(sunCall).toBeDefined()
      const sunContent = sunCall?.[1] as string
      const parsed = JSON.parse(sunContent)

      expect(parsed.toronto.properties.sunrise).toBeNull()
      expect(parsed.toronto.properties.sunset).toBeNull()
    })

    it('should preserve null values in moon data', async () => {
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

      await writeData(mockSunData, moonWithNulls, 'api/static/data')

      const moonCall = vi.mocked(fs.writeFile).mock.calls.find(call =>
        call[0].toString().includes('moon.json')
      )
      expect(moonCall).toBeDefined()
      const moonContent = moonCall?.[1] as string
      const parsed = JSON.parse(moonContent)

      expect(parsed.toronto.properties.moonrise).toBeNull()
      expect(parsed.toronto.properties.moonphase).toBeNull()
    })
  })

  describe('execution order', () => {
    it('should create directory before writing files', async () => {
      const callOrder: string[] = []

      vi.mocked(fs.mkdir).mockImplementation(async () => {
        callOrder.push('mkdir')
        return undefined
      })
      vi.mocked(fs.writeFile).mockImplementation(async () => {
        callOrder.push('writeFile')
      })

      await writeData(mockSunData, mockMoonData, 'api/static/data')

      expect(callOrder[0]).toBe('mkdir')
      expect(callOrder[1]).toBe('writeFile')
      expect(callOrder[2]).toBe('writeFile')
    })

    it('should write both files after directory is created', async () => {
      let dirCreated = false

      vi.mocked(fs.mkdir).mockImplementation(async () => {
        dirCreated = true
        return undefined
      })
      vi.mocked(fs.writeFile).mockImplementation(async () => {
        expect(dirCreated).toBe(true)
      })

      await writeData(mockSunData, mockMoonData, 'api/static/data')

      expect(fs.writeFile).toHaveBeenCalledTimes(2)
    })
  })
})
