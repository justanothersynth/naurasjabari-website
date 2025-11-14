import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { runJob } from '../../../jobs/azimuth/runner'
import type { SunResponse, MoonResponse } from '@workspace/types'
import * as fs from 'fs'
import * as path from 'path'

// Only mock the external dependencies (database and JWT)
vi.mock('@workspace/utils', async () => {
  const actual = await vi.importActual('@workspace/utils')
  return {
    ...actual,
    generateInternalJWT: vi.fn().mockResolvedValue('mock-jwt-token'),
    logError: vi.fn()
  }
})

vi.mock('@workspace/api/lib/sun-moon', () => {
  const mockCallable = vi.fn().mockResolvedValue({
    status: 200,
    message: 'Success'
  })
  return {
    createLocation: {
      internal: vi.fn(() => mockCallable)
    }
  }
})

vi.mock('../../../config', () => ({
  config: {
    supabase: {
      jwtSecret: 'test-secret',
      jwtIssuer: 'test-issuer',
      jwtSubject: 'test-subject'
    },
    redis: {
      host: 'localhost',
      port: 6379
    }
  },
  logger: {
    withContext: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn()
    }))
  }
}))

vi.mock('../../../config/redis', () => ({
  redisConnection: {
    host: 'localhost',
    port: 6379
  }
}))

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    pause: vi.fn(),
    obliterate: vi.fn(),
    close: vi.fn()
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    close: vi.fn()
  }))
}))

describe('runJob (integration)', () => {
  let tempDir: string
  let sunFilePath: string
  let moonFilePath: string
  let originalCwd: string

  const createMockSunResponse = (): SunResponse => ({
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
  })

  const createMockMoonResponse = (): MoonResponse => ({
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
  })

  const setupTestFiles = (locations: string[]) => {
    const sunData: Record<string, SunResponse> = {}
    const moonData: Record<string, MoonResponse> = {}

    locations.forEach(location => {
      sunData[location] = createMockSunResponse()
      moonData[location] = createMockMoonResponse()
    })

    fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))
    fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))
  }

  beforeEach(() => {
    // Create temp directory inside crons/tmp (relative to test file: ../../../tmp)
    tempDir = path.join(import.meta.dirname, '../../../tmp', `test-azimuth-${Date.now()}-${Math.random().toString(36).substring(7)}`)
    fs.mkdirSync(tempDir, { recursive: true })

    // Save original cwd and change to temp dir structure
    originalCwd = process.cwd()
    
    // Create the expected directory structure
    const apiStaticDataDir = path.join(tempDir, 'packages', 'api', 'static', 'data')
    fs.mkdirSync(apiStaticDataDir, { recursive: true })

    const cronsDir = path.join(tempDir, 'packages', 'crons')
    fs.mkdirSync(cronsDir, { recursive: true })

    sunFilePath = path.join(apiStaticDataDir, 'sun.json')
    moonFilePath = path.join(apiStaticDataDir, 'moon.json')

    // Change working directory to mimic the cron job structure
    process.chdir(cronsDir)

    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd)

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    vi.restoreAllMocks()
  })

  describe('end-to-end flow with real data files', () => {
    it('should read sun and moon data from files and process them', async () => {
      setupTestFiles(['toronto', 'vancouver'])

      await runJob()

      // Import mocked modules to check calls
      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any

      expect(mockCreateLocation).toHaveBeenCalledTimes(1)
      expect(mockCreateLocation).toHaveBeenCalledWith({
        headers: { authorization: 'Bearer mock-jwt-token' }
      })

      // Verify the callable was called with processed metadata
      const callable = mockCreateLocation.mock.results[0].value
      expect(callable).toHaveBeenCalledTimes(1)
      
      const metadata = callable.mock.calls[0][0]
      expect(metadata).toHaveProperty('toronto')
      expect(metadata).toHaveProperty('vancouver')
    })

    it('should process all 8 locations correctly', async () => {
      const locations = ['toronto', 'vancouver', 'kosiv', 'montreal', 'heidelberg', 'bristol', 'snowdonia', 'sayulita']
      setupTestFiles(locations)

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(Object.keys(metadata)).toHaveLength(8)
      locations.forEach(location => {
        expect(metadata).toHaveProperty(location)
      })
    })

    it('should calculate normalized azimuths from real data', async () => {
      setupTestFiles(['toronto'])

      // Mock the current time to be during the day
      const mockTime = new Date('2025-01-15T12:00:00-05:00')
      vi.useFakeTimers()
      vi.setSystemTime(mockTime)

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto).toBeDefined()
      expect(metadata.toronto.sunAzimuth).toBeDefined()
      expect(metadata.toronto.moonAzimuth).toBeDefined()
      expect(metadata.toronto.period).toBe('day')

      vi.useRealTimers()
    })

    it('should include all metadata fields', async () => {
      setupTestFiles(['toronto'])

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      const torontoData = metadata.toronto
      expect(torontoData).toHaveProperty('sunAzimuth')
      expect(torontoData).toHaveProperty('moonAzimuth')
      expect(torontoData).toHaveProperty('moonPhase')
      expect(torontoData).toHaveProperty('period')
      expect(torontoData).toHaveProperty('sunriseTime')
      expect(torontoData).toHaveProperty('sunriseAzimuth')
      expect(torontoData).toHaveProperty('sunsetTime')
      expect(torontoData).toHaveProperty('sunsetAzimuth')
      expect(torontoData).toHaveProperty('moonriseTime')
      expect(torontoData).toHaveProperty('moonriseAzimuth')
      expect(torontoData).toHaveProperty('moonsetTime')
      expect(torontoData).toHaveProperty('moonsetAzimuth')
    })

    it('should preserve original time strings from files', async () => {
      setupTestFiles(['toronto'])

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.sunriseTime).toBe('2025-01-15T07:30:00-05:00')
      expect(metadata.toronto.sunsetTime).toBe('2025-01-15T17:30:00-05:00')
      expect(metadata.toronto.moonriseTime).toBe('2025-01-15T09:00:00-05:00')
      expect(metadata.toronto.moonsetTime).toBe('2025-01-15T20:00:00-05:00')
    })

    it('should preserve original azimuth values from files', async () => {
      setupTestFiles(['toronto'])

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.sunriseAzimuth).toBe(120.5)
      expect(metadata.toronto.sunsetAzimuth).toBe(240.5)
      expect(metadata.toronto.moonriseAzimuth).toBe(95.0)
      expect(metadata.toronto.moonsetAzimuth).toBe(265.0)
    })

    it('should preserve moon phase from files', async () => {
      setupTestFiles(['toronto'])

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.moonPhase).toBe(0.5)
    })
  })

  describe('error scenarios with real files', () => {
    it('should throw error when sun.json does not exist', async () => {
      // Only create moon.json
      const moonData = {
        toronto: createMockMoonResponse()
      }
      fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))

      // Should throw after delay (10 seconds)
      await expect(runJob()).rejects.toThrow('Sun or moon data files not found')

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    }, 15000) // 15 second timeout to account for the 10 second delay

    it('should throw error when moon.json does not exist', async () => {
      // Only create sun.json
      const sunData = {
        toronto: createMockSunResponse()
      }
      fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))

      // Should throw after delay (10 seconds)
      await expect(runJob()).rejects.toThrow('Sun or moon data files not found')

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    }, 15000) // 15 second timeout to account for the 10 second delay

    it('should throw error when both files do not exist', async () => {
      // Don't create any files

      // Should throw after delay (10 seconds)
      await expect(runJob()).rejects.toThrow('Sun or moon data files not found')

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    }, 15000) // 15 second timeout to account for the 10 second delay

    it('should throw error when sun.json contains invalid JSON', async () => {
      fs.writeFileSync(sunFilePath, '{ invalid json }')
      fs.writeFileSync(moonFilePath, JSON.stringify({ toronto: createMockMoonResponse() }, null, 2))

      await expect(runJob()).rejects.toThrow()

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    })

    it('should throw error when moon.json contains invalid JSON', async () => {
      fs.writeFileSync(sunFilePath, JSON.stringify({ toronto: createMockSunResponse() }, null, 2))
      fs.writeFileSync(moonFilePath, '{ invalid json }')

      await expect(runJob()).rejects.toThrow()

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    })

    it('should throw error when database call fails', async () => {
      setupTestFiles(['toronto'])

      // Mock database failure
      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      const mockCallable = vi.fn().mockRejectedValue(new Error('Database error'))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(createLocationModule.createLocation, 'internal').mockReturnValue(mockCallable as any)

      await expect(runJob()).rejects.toThrow('Database error')

      const utilsModule = await import('@workspace/utils')
      expect(utilsModule.logError).toHaveBeenCalled()
    })
  })

  describe('data variations', () => {
    it('should handle location with null sunrise and sunset', async () => {
      const sunData = {
        arctic: {
          ...createMockSunResponse(),
          properties: {
            body: 'Sun' as const,
            sunrise: null,
            sunset: null,
            solarnoon: {
              time: '2025-01-15T12:00:00Z',
              disc_centre_elevation: -5.0,
              visible: false
            },
            solarmidnight: {
              time: '2025-01-15T00:00:00Z',
              disc_centre_elevation: -25.0,
              visible: false
            }
          }
        }
      }
      const moonData = {
        arctic: createMockMoonResponse()
      }

      fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))
      fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.arctic.sunAzimuth).toBeNull()
      expect(metadata.arctic.period).toBeNull()
    })

    it('should handle location with null moonrise and moonset', async () => {
      const sunData = {
        location: createMockSunResponse()
      }
      const moonData = {
        location: {
          ...createMockMoonResponse(),
          properties: {
            body: 'Moon' as const,
            moonrise: null,
            moonset: null,
            high_moon: {
              time: '2025-01-15T14:00:00Z',
              disc_centre_elevation: 20.0,
              visible: true
            },
            low_moon: {
              time: '2025-01-15T02:00:00Z',
              disc_centre_elevation: -20.0,
              visible: false
            },
            moonphase: 0.75
          }
        }
      }

      fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))
      fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.location.moonAzimuth).toBeNull()
      expect(metadata.location.moonPhase).toBe(0.75)
    })

    it('should skip locations without matching moon data', async () => {
      const sunData = {
        toronto: createMockSunResponse(),
        vancouver: createMockSunResponse()
      }
      const moonData = {
        toronto: createMockMoonResponse()
        // vancouver missing
      }

      fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))
      fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata).toHaveProperty('toronto')
      expect(metadata).not.toHaveProperty('vancouver')
      expect(Object.keys(metadata)).toHaveLength(1)
    })

    it('should handle empty sun and moon data files', async () => {
      fs.writeFileSync(sunFilePath, JSON.stringify({}, null, 2))
      fs.writeFileSync(moonFilePath, JSON.stringify({}, null, 2))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(Object.keys(metadata)).toHaveLength(0)
    })

    it('should handle different moon phases', async () => {
      const moonPhases = [0, 0.25, 0.5, 0.75, 0.99]
      const locations = ['loc0', 'loc1', 'loc2', 'loc3', 'loc4']

      const sunData: Record<string, SunResponse> = {}
      const moonData: Record<string, MoonResponse> = {}

      locations.forEach((loc, index) => {
        sunData[loc] = createMockSunResponse()
        moonData[loc] = {
          ...createMockMoonResponse(),
          properties: {
            ...createMockMoonResponse().properties,
            moonphase: moonPhases[index]!
          }
        }
      })

      fs.writeFileSync(sunFilePath, JSON.stringify(sunData, null, 2))
      fs.writeFileSync(moonFilePath, JSON.stringify(moonData, null, 2))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      locations.forEach((loc, index) => {
        expect(metadata[loc].moonPhase).toBe(moonPhases[index])
      })
    })
  })

  describe('time-based calculations', () => {
    it('should calculate day period when current time is between sunrise and sunset', async () => {
      setupTestFiles(['toronto'])

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T10:00:00-05:00')) // Morning

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.period).toBe('day')
      expect(metadata.toronto.sunAzimuth).toBeLessThan(180)

      vi.useRealTimers()
    })

    it('should calculate night period when current time is after sunset', async () => {
      setupTestFiles(['toronto'])

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T20:00:00-05:00')) // Evening

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.period).toBe('night')
      expect(metadata.toronto.sunAzimuth).toBeGreaterThan(180)

      vi.useRealTimers()
    })

    it('should calculate night period when current time is before sunrise', async () => {
      setupTestFiles(['toronto'])

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T05:00:00-05:00')) // Early morning

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.period).toBe('night')
      expect(metadata.toronto.sunAzimuth).toBeGreaterThan(180)

      vi.useRealTimers()
    })

    it('should handle different times for multiple locations', async () => {
      setupTestFiles(['toronto', 'vancouver'])

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-15T12:00:00-05:00'))

      await runJob()

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any
      const callable = mockCreateLocation.mock.results[0].value
      const metadata = callable.mock.calls[0][0]

      expect(metadata.toronto.sunAzimuth).toBeDefined()
      expect(metadata.vancouver.sunAzimuth).toBeDefined()
      expect(metadata.toronto.moonAzimuth).toBeDefined()
      expect(metadata.vancouver.moonAzimuth).toBeDefined()

      vi.useRealTimers()
    })
  })

  describe('authentication flow', () => {
    it('should generate JWT and pass it to createLocation', async () => {
      setupTestFiles(['toronto'])

      const utilsModule = await import('@workspace/utils')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockGenerateJWT = utilsModule.generateInternalJWT as any
      mockGenerateJWT.mockResolvedValue('custom-token-xyz')

      await runJob()

      expect(mockGenerateJWT).toHaveBeenCalledWith(
        'test-secret',
        'test-issuer',
        'test-subject'
      )

      const createLocationModule = await import('@workspace/api/lib/sun-moon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockCreateLocation = createLocationModule.createLocation.internal as any

      expect(mockCreateLocation).toHaveBeenCalledWith({
        headers: { authorization: 'Bearer custom-token-xyz' }
      })
    })

    it('should handle JWT generation failure', async () => {
      setupTestFiles(['toronto'])

      const utilsModule = await import('@workspace/utils')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockGenerateJWT = utilsModule.generateInternalJWT as any
      mockGenerateJWT.mockRejectedValue(new Error('JWT generation failed'))

      await expect(runJob()).rejects.toThrow('JWT generation failed')
    })
  })
})
