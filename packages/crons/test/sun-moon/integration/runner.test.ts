import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runJob } from '../../../jobs/sun-moon/runner'
import { LOCATIONS } from '../../../jobs/sun-moon/locations'
import type { SunResponse, MoonResponse } from '@workspace/types'
import * as fs from 'fs/promises'
import * as path from 'path'
import { existsSync } from 'fs'

describe('runJob (integration)', () => {
  let tempDir: string
  const mockFetch = vi.fn()

  const createMockSunResponse = (lat: number, lon: number, hasNull = false): SunResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    when: {
      interval: ['2025-01-01', '2025-01-02']
    },
    properties: {
      body: 'Sun',
      sunrise: hasNull ? null : {
        time: '2025-01-01T07:51:00-05:00',
        azimuth: 120.5
      },
      sunset: hasNull ? null : {
        time: '2025-01-01T16:45:00-05:00',
        azimuth: 239.5
      },
      solarnoon: {
        time: '2025-01-01T12:18:00-05:00',
        disc_centre_elevation: hasNull ? -5.5 : 23.45,
        visible: !hasNull
      },
      solarmidnight: {
        time: '2025-01-01T00:18:00-05:00',
        disc_centre_elevation: -66.55,
        visible: false
      }
    }
  })

  const createMockMoonResponse = (lat: number, lon: number, phase = 0.45): MoonResponse => ({
    copyright: 'MET Norway',
    licenseURL: 'https://api.met.no/license_data.html',
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
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
      moonphase: phase
    }
  })

  const setupDefaultMocks = () => {
    // Setup mock responses for all locations with default values
    Object.values(LOCATIONS).forEach(location => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(location.lat, location.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(location.lat, location.lon)
        })
    })
  }

  beforeEach(async () => {
    // Create a unique temporary directory for this test (relative path)
    tempDir = `test-output-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Mock fetch
    global.fetch = mockFetch as unknown as typeof fetch
    mockFetch.mockReset()

    // Setup default mock responses
    setupDefaultMocks()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    
    // Clean up temporary directory (convert to absolute path for cleanup)
    const absoluteTempDir = path.join(process.cwd(), tempDir)
    if (existsSync(absoluteTempDir)) {
      await fs.rm(absoluteTempDir, { recursive: true, force: true })
    }
  })

  describe('end-to-end flow', () => {
    it('should fetch data from API and write files to temp directory', async () => {
      await runJob(tempDir)

      // Verify files were created (use absolute paths for checking)
      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const moonFilePath = path.join(absoluteTempDir, 'moon.json')

      expect(existsSync(sunFilePath)).toBe(true)
      expect(existsSync(moonFilePath)).toBe(true)
    })

    it('should write sun.json with correct structure', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const sunData = JSON.parse(sunContent) as Record<string, SunResponse>

      // Verify all locations are present
      expect(Object.keys(sunData)).toHaveLength(8)
      expect(sunData).toHaveProperty('toronto')
      expect(sunData).toHaveProperty('vancouver')
      expect(sunData).toHaveProperty('kosiv')
      expect(sunData).toHaveProperty('montreal')
      expect(sunData).toHaveProperty('heidelberg')
      expect(sunData).toHaveProperty('bristol')
      expect(sunData).toHaveProperty('snowdonia')
      expect(sunData).toHaveProperty('sayulita')

      // Verify structure of one location
      expect(sunData.toronto).toHaveProperty('copyright', 'MET Norway')
      expect(sunData.toronto).toHaveProperty('type', 'Feature')
      expect(sunData.toronto?.properties).toHaveProperty('body', 'Sun')
      expect(sunData.toronto?.properties).toHaveProperty('sunrise')
      expect(sunData.toronto?.properties).toHaveProperty('sunset')
    })

    it('should write moon.json with correct structure', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const moonFilePath = path.join(absoluteTempDir, 'moon.json')
      const moonContent = await fs.readFile(moonFilePath, 'utf8')
      const moonData = JSON.parse(moonContent) as Record<string, MoonResponse>

      // Verify all locations are present
      expect(Object.keys(moonData)).toHaveLength(8)
      expect(moonData).toHaveProperty('toronto')
      expect(moonData).toHaveProperty('vancouver')

      // Verify structure of one location
      expect(moonData.toronto).toHaveProperty('copyright', 'MET Norway')
      expect(moonData.toronto).toHaveProperty('type', 'Feature')
      expect(moonData.toronto?.properties).toHaveProperty('body', 'Moon')
      expect(moonData.toronto?.properties).toHaveProperty('moonrise')
      expect(moonData.toronto?.properties).toHaveProperty('moonset')
      expect(moonData.toronto?.properties).toHaveProperty('moonphase')
    })

    it('should call fetch API for all 8 locations (sun + moon each)', async () => {
      await runJob(tempDir)

      // 8 locations × 2 calls (sun + moon) = 16 total fetch calls
      expect(mockFetch).toHaveBeenCalledTimes(16)
    })

    it('should create directory if it does not exist', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'path', 'data')
      const absoluteNestedDir = path.join(process.cwd(), nestedDir)

      expect(existsSync(absoluteNestedDir)).toBe(false)

      await runJob(nestedDir)

      expect(existsSync(absoluteNestedDir)).toBe(true)
      expect(existsSync(path.join(absoluteNestedDir, 'sun.json'))).toBe(true)
      expect(existsSync(path.join(absoluteNestedDir, 'moon.json'))).toBe(true)
    })

    it('should write valid JSON that can be parsed', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const moonFilePath = path.join(absoluteTempDir, 'moon.json')

      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const moonContent = await fs.readFile(moonFilePath, 'utf8')

      // Should not throw
      expect(() => JSON.parse(sunContent)).not.toThrow()
      expect(() => JSON.parse(moonContent)).not.toThrow()

      const sunData = JSON.parse(sunContent)
      const moonData = JSON.parse(moonContent)

      expect(typeof sunData).toBe('object')
      expect(typeof moonData).toBe('object')
    })

    it('should write formatted JSON with proper indentation', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const sunContent = await fs.readFile(sunFilePath, 'utf8')

      // Check that JSON is formatted with 2-space indentation
      expect(sunContent).toContain('\n  ')
      expect(sunContent).toMatch(/"toronto":\s*\{/)
    })

    it('should include correct coordinates for each location', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const sunData = JSON.parse(sunContent) as Record<string, SunResponse>

      // Verify coordinates match the mocked responses
      Object.entries(LOCATIONS).forEach(([locationName, location]) => {
        const sunEntry = sunData[locationName]
        expect(sunEntry?.geometry.coordinates[1]).toBe(location.lat)
        expect(sunEntry?.geometry.coordinates[0]).toBe(location.lon)
      })
    })
  })

  describe('real-world scenarios', () => {
    it('should handle locations with varied sun/moon times', async () => {
      // Mock different responses for different locations
      mockFetch.mockReset()

      // Toronto - normal times with phase 0.25
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.toronto.lat, LOCATIONS.toronto.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.toronto.lat, LOCATIONS.toronto.lon, 0.25)
        })

      // Vancouver - different phase 0.75
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.vancouver.lat, LOCATIONS.vancouver.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.vancouver.lat, LOCATIONS.vancouver.lon, 0.75)
        })

      // Kosiv - phase 0.5
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.kosiv.lat, LOCATIONS.kosiv.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.kosiv.lat, LOCATIONS.kosiv.lon, 0.5)
        })

      // Montreal
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.montreal.lat, LOCATIONS.montreal.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.montreal.lat, LOCATIONS.montreal.lon)
        })

      // Heidelberg
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.heidelberg.lat, LOCATIONS.heidelberg.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.heidelberg.lat, LOCATIONS.heidelberg.lon)
        })

      // Bristol
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.bristol.lat, LOCATIONS.bristol.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.bristol.lat, LOCATIONS.bristol.lon)
        })

      // Snowdonia
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.snowdonia.lat, LOCATIONS.snowdonia.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.snowdonia.lat, LOCATIONS.snowdonia.lon)
        })

      // Sayulita
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockSunResponse(LOCATIONS.sayulita.lat, LOCATIONS.sayulita.lon)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockMoonResponse(LOCATIONS.sayulita.lat, LOCATIONS.sayulita.lon)
        })

      await runJob(tempDir)

      const moonFilePath = path.join(tempDir, 'moon.json')
      const moonContent = await fs.readFile(moonFilePath, 'utf8')
      const moonData = JSON.parse(moonContent) as Record<string, MoonResponse>

      expect(moonData.toronto?.properties.moonphase).toBe(0.25)
      expect(moonData.vancouver?.properties.moonphase).toBe(0.75)
      expect(moonData.kosiv?.properties.moonphase).toBe(0.5)
    })

    it('should handle polar night scenario (no sun)', async () => {
      mockFetch.mockReset()

      // All locations with null sunrise/sunset (polar night)
      Object.values(LOCATIONS).forEach(location => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockSunResponse(location.lat, location.lon, true)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockMoonResponse(location.lat, location.lon)
          })
      })

      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const sunData = JSON.parse(sunContent) as Record<string, SunResponse>

      // Verify all locations have null sunrise/sunset
      Object.values(sunData).forEach(sun => {
        expect(sun?.properties.sunrise).toBeNull()
        expect(sun?.properties.sunset).toBeNull()
        expect(sun?.properties.solarnoon?.visible).toBe(false)
      })
    })

    it('should verify date formatting in output', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const sunData = JSON.parse(sunContent) as Record<string, SunResponse>

      // Verify date format in when.interval
      Object.values(sunData).forEach(sun => {
        expect(sun.when.interval).toHaveLength(2)
        expect(sun.when.interval[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(sun.when.interval[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should handle API response with different moon phases', async () => {
      mockFetch.mockReset()

      const phases = [0, 0.25, 0.5, 0.75, 0.99, 0.12, 0.38, 0.62]
      const locationEntries = Object.values(LOCATIONS)

      locationEntries.forEach((location, index) => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockSunResponse(location.lat, location.lon)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockMoonResponse(location.lat, location.lon, phases[index])
          })
      })

      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const moonFilePath = path.join(absoluteTempDir, 'moon.json')
      const moonContent = await fs.readFile(moonFilePath, 'utf8')
      const moonData = JSON.parse(moonContent) as Record<string, MoonResponse>

      const locationKeys = Object.keys(LOCATIONS)
      locationKeys.forEach((key, index) => {
        expect(moonData[key]?.properties.moonphase).toBe(phases[index])
      })
    })

    it('should complete successfully when overwriting existing files', async () => {
      // First run
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const firstContent = await fs.readFile(sunFilePath, 'utf8')

      // Setup new mock responses
      mockFetch.mockReset()
      Object.values(LOCATIONS).forEach(location => {
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockSunResponse(location.lat, location.lon)
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockMoonResponse(location.lat, location.lon, 0.99)
          })
      })

      // Second run - should overwrite
      await runJob(tempDir)

      const secondContent = await fs.readFile(sunFilePath, 'utf8')

      // Content should be valid JSON in both cases
      expect(() => JSON.parse(firstContent)).not.toThrow()
      expect(() => JSON.parse(secondContent)).not.toThrow()

      // Files should exist
      expect(existsSync(sunFilePath)).toBe(true)
      expect(existsSync(path.join(absoluteTempDir, 'moon.json'))).toBe(true)
    })

    it('should handle all 8 locations correctly', async () => {
      await runJob(tempDir)

      const absoluteTempDir = path.join(process.cwd(), tempDir)
      const sunFilePath = path.join(absoluteTempDir, 'sun.json')
      const moonFilePath = path.join(absoluteTempDir, 'moon.json')

      const sunContent = await fs.readFile(sunFilePath, 'utf8')
      const moonContent = await fs.readFile(moonFilePath, 'utf8')

      const sunData = JSON.parse(sunContent) as Record<string, SunResponse>
      const moonData = JSON.parse(moonContent) as Record<string, MoonResponse>

      // Verify exact location names
      const expectedLocations = ['toronto', 'vancouver', 'kosiv', 'montreal', 'heidelberg', 'bristol', 'snowdonia', 'sayulita']
      
      expectedLocations.forEach(location => {
        expect(sunData).toHaveProperty(location)
        expect(moonData).toHaveProperty(location)
        expect(sunData[location]?.properties.body).toBe('Sun')
        expect(moonData[location]?.properties.body).toBe('Moon')
      })
    })
  })

  describe('error scenarios', () => {
    it('should throw error when API returns 404', async () => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(runJob(tempDir)).rejects.toThrow('Met.no sun API error: 404 Not Found')

      // Files should not be created
      const absoluteTempDir = path.join(process.cwd(), tempDir)
      expect(existsSync(path.join(absoluteTempDir, 'sun.json'))).toBe(false)
      expect(existsSync(path.join(absoluteTempDir, 'moon.json'))).toBe(false)
    })

    it('should throw error when API returns invalid JSON', async () => {
      mockFetch.mockReset()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'structure' })
      })

      await expect(runJob(tempDir)).rejects.toThrow()

      // Files should not be created
      const absoluteTempDir = path.join(process.cwd(), tempDir)
      expect(existsSync(path.join(absoluteTempDir, 'sun.json'))).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockReset()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(runJob(tempDir)).rejects.toThrow('Network error')

      // Files should not be created
      const absoluteTempDir = path.join(process.cwd(), tempDir)
      expect(existsSync(path.join(absoluteTempDir, 'sun.json'))).toBe(false)
      expect(existsSync(path.join(absoluteTempDir, 'moon.json'))).toBe(false)
    })
  })
})
