import { describe, it, expect } from 'vitest'
import { normalizeAzimuthToDayCycle, getSunMoonStatus } from '../../../jobs/azimuth/normalize-azimuth'

describe('normalizeAzimuthToDayCycle', () => {
  describe('daytime calculation (between rise and set)', () => {
    it('should return 0° at rise time', () => {
      const currentTime = new Date('2025-01-15T07:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(0)
    })

    it('should return 180° at set time', () => {
      const currentTime = new Date('2025-01-15T17:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(180)
    })

    it('should return 90° at midpoint between rise and set', () => {
      const currentTime = new Date('2025-01-15T12:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(90)
    })

    it('should calculate correct azimuth at 25% through the day', () => {
      const currentTime = new Date('2025-01-15T10:00:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(45)
    })

    it('should calculate correct azimuth at 75% through the day', () => {
      const currentTime = new Date('2025-01-15T15:00:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(135)
    })

    it('should handle short day duration (winter)', () => {
      const currentTime = new Date('2025-12-21T10:00:00-05:00')
      const riseTime = '2025-12-21T07:50:00-05:00'
      const setTime = '2025-12-21T16:40:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // About 2.17 hours into 8.83 hour day = ~24.5% = ~44°
      expect(result).toBeCloseTo(44.5, 0)
    })

    it('should handle long day duration (summer)', () => {
      const currentTime = new Date('2025-06-21T12:00:00-04:00')
      const riseTime = '2025-06-21T05:30:00-04:00'
      const setTime = '2025-06-21T20:45:00-04:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // About 6.5 hours into 15.25 hour day = ~42.6% = ~76.7°
      expect(result).toBeCloseTo(76.7, 0)
    })

    it('should handle time just after rise', () => {
      const currentTime = new Date('2025-01-15T07:31:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(1)
    })

    it('should handle time just before set', () => {
      const currentTime = new Date('2025-01-15T17:29:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBeGreaterThan(179)
      expect(result).toBeLessThan(180)
    })
  })

  describe('nighttime calculation (after set or before rise)', () => {
    it('should return 180° right at set time transitioning to night', () => {
      const currentTime = new Date('2025-01-15T17:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBe(180)
    })

    it('should calculate azimuth in evening (after set, before midnight)', () => {
      const currentTime = new Date('2025-01-15T20:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // 3 hours after set, night duration is ~14 hours
      // Progress: 3/14 = ~21.4% through night = 180 + (0.214 * 180) = ~218.5°
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(270)
    })

    it('should calculate azimuth at midnight', () => {
      const currentTime = new Date('2025-01-16T00:00:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // About 6.5 hours after set, night duration is ~14 hours
      // Progress: 6.5/14 = ~46.4% through night = 180 + (0.464 * 180) = ~263.5°
      expect(result).toBeGreaterThan(260)
      expect(result).toBeLessThan(270)
    })

    it('should calculate azimuth in early morning (after midnight, before rise)', () => {
      const currentTime = new Date('2025-01-16T05:00:00-05:00')
      const riseTime = '2025-01-16T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // Early morning before rise, should be in 180-360 range
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })

    it('should handle time just after set (evening)', () => {
      const currentTime = new Date('2025-01-15T17:31:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(181)
    })

    it('should handle time just before rise (early morning)', () => {
      const currentTime = new Date('2025-01-16T07:29:00-05:00')
      const riseTime = '2025-01-16T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // Should be in late night range
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })

    it('should handle long night duration (summer)', () => {
      const currentTime = new Date('2025-06-22T02:00:00-04:00')
      const riseTime = '2025-06-22T05:30:00-04:00'
      const setTime = '2025-06-21T20:45:00-04:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // Early morning during short summer night
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })

    it('should handle short night duration (winter)', () => {
      const currentTime = new Date('2025-12-22T00:00:00-05:00')
      const riseTime = '2025-12-22T07:50:00-05:00'
      const setTime = '2025-12-21T16:40:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // Midnight during long winter night
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })
  })

  describe('edge cases and boundary conditions', () => {
    it('should handle times across timezone boundaries', () => {
      const currentTime = new Date('2025-01-15T12:30:00Z')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // This is 7:30 AM EST which is exactly at rise
      expect(result).toBe(0)
    })

    it('should normalize result to 0-360 range with modulo', () => {
      // Edge case where calculation might exceed 360
      const currentTime = new Date('2025-01-16T07:29:59-05:00')
      const riseTime = '2025-01-16T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(360)
    })

    it('should handle very short day duration (polar regions)', () => {
      const currentTime = new Date('2025-12-21T09:00:00-05:00')
      const riseTime = '2025-12-21T08:30:00-05:00'
      const setTime = '2025-12-21T09:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // 30 minutes into 1 hour day = 50% = 90°
      expect(result).toBe(90)
    })

    it('should handle same rise and set time (edge case)', () => {
      const currentTime = new Date('2025-01-15T07:30:00-05:00')
      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T07:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // When rise === set === current, should return 0 or NaN
      // The function will divide by 0, resulting in NaN * 180 = NaN
      expect(isNaN(result)).toBe(true)
    })

    it('should handle date with milliseconds', () => {
      const currentTime = new Date('2025-01-15T12:30:00.500-05:00')
      const riseTime = '2025-01-15T07:30:00.000-05:00'
      const setTime = '2025-01-15T17:30:00.000-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      expect(result).toBeCloseTo(90, 0)
    })

    it('should handle leap second edge case', () => {
      const currentTime = new Date('2025-06-30T23:59:59-04:00')
      const riseTime = '2025-06-30T05:30:00-04:00'
      const setTime = '2025-06-30T20:45:00-04:00'

      const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)

      // Late evening, should be in night range
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })

    it('should consistently return values between 0 and 360', () => {
      const testCases = [
        new Date('2025-01-15T00:00:00-05:00'),
        new Date('2025-01-15T06:00:00-05:00'),
        new Date('2025-01-15T12:00:00-05:00'),
        new Date('2025-01-15T18:00:00-05:00'),
        new Date('2025-01-15T23:59:59-05:00')
      ]

      const riseTime = '2025-01-15T07:30:00-05:00'
      const setTime = '2025-01-15T17:30:00-05:00'

      testCases.forEach(currentTime => {
        const result = normalizeAzimuthToDayCycle(currentTime, riseTime, setTime)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(360)
      })
    })
  })

  describe('moon-specific scenarios', () => {
    it('should handle moonrise during the day', () => {
      const currentTime = new Date('2025-01-15T14:00:00-05:00')
      const moonriseTime = '2025-01-15T09:15:00-05:00'
      const moonsetTime = '2025-01-15T20:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, moonriseTime, moonsetTime)

      // About 4.75 hours into ~11.25 hour visible period = ~42.2% = ~76°
      expect(result).toBeCloseTo(76, 0)
    })

    it('should handle moonrise at night', () => {
      const currentTime = new Date('2025-01-16T02:00:00-05:00')
      const moonriseTime = '2025-01-15T21:30:00-05:00'
      const moonsetTime = '2025-01-16T08:45:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, moonriseTime, moonsetTime)

      // About 4.5 hours into ~11.25 hour visible period = 40% = 72°
      expect(result).toBeCloseTo(72, 0)
    })

    it('should handle moon not visible (before moonrise)', () => {
      const currentTime = new Date('2025-01-15T06:00:00-05:00')
      const moonriseTime = '2025-01-15T09:15:00-05:00'
      const moonsetTime = '2025-01-15T20:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, moonriseTime, moonsetTime)

      // Early morning before moonrise, should be in 180-360 range
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })

    it('should handle moon not visible (after moonset)', () => {
      const currentTime = new Date('2025-01-15T22:00:00-05:00')
      const moonriseTime = '2025-01-15T09:15:00-05:00'
      const moonsetTime = '2025-01-15T20:30:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, moonriseTime, moonsetTime)

      // Evening after moonset, should be in 180-360 range
      expect(result).toBeGreaterThan(180)
      expect(result).toBeLessThan(360)
    })
  })

  describe('real-world scenarios', () => {
    it('should handle typical winter sunrise/sunset in Toronto', () => {
      const currentTime = new Date('2025-01-15T12:00:00-05:00')
      const sunriseTime = '2025-01-15T07:51:00-05:00'
      const sunsetTime = '2025-01-15T17:17:00-05:00'

      const result = normalizeAzimuthToDayCycle(currentTime, sunriseTime, sunsetTime)

      // About 4.15 hours into ~9.43 hour day = ~44% = ~79°
      expect(result).toBeCloseTo(79, 0)
    })

    it('should handle typical summer sunrise/sunset in Toronto', () => {
      const currentTime = new Date('2025-06-21T14:00:00-04:00')
      const sunriseTime = '2025-06-21T05:36:00-04:00'
      const sunsetTime = '2025-06-21T21:02:00-04:00'

      const result = normalizeAzimuthToDayCycle(currentTime, sunriseTime, sunsetTime)

      // About 8.4 hours into ~15.43 hour day = ~54.5% = ~98°
      expect(result).toBeCloseTo(98, 0)
    })

    it('should handle typical winter sunrise/sunset in Vancouver', () => {
      const currentTime = new Date('2025-01-15T10:00:00-08:00')
      const sunriseTime = '2025-01-15T08:03:00-08:00'
      const sunsetTime = '2025-01-15T16:43:00-08:00'

      const result = normalizeAzimuthToDayCycle(currentTime, sunriseTime, sunsetTime)

      // About 1.95 hours into ~8.67 hour day = ~22.5% = ~40.5°
      expect(result).toBeCloseTo(40.5, 0)
    })

    it('should handle equinox sunrise/sunset', () => {
      const currentTime = new Date('2025-03-20T12:00:00-04:00')
      const sunriseTime = '2025-03-20T07:15:00-04:00'
      const sunsetTime = '2025-03-20T19:15:00-04:00'

      const result = normalizeAzimuthToDayCycle(currentTime, sunriseTime, sunsetTime)

      // About 4.75 hours into 12 hour day = ~39.6% = ~71.25°
      expect(result).toBeCloseTo(71.25, 0)
    })
  })
})

describe('getSunMoonStatus', () => {
  describe('day status', () => {
    it('should return "day" for azimuth 0', () => {
      const result = getSunMoonStatus(0)
      expect(result).toBe('day')
    })

    it('should return "day" for azimuth 1', () => {
      const result = getSunMoonStatus(1)
      expect(result).toBe('day')
    })

    it('should return "day" for azimuth 90', () => {
      const result = getSunMoonStatus(90)
      expect(result).toBe('day')
    })

    it('should return "day" for azimuth 179', () => {
      const result = getSunMoonStatus(179)
      expect(result).toBe('day')
    })

    it('should return "day" for azimuth 179.9', () => {
      const result = getSunMoonStatus(179.9)
      expect(result).toBe('day')
    })

    it('should return "day" for azimuth 179.999', () => {
      const result = getSunMoonStatus(179.999)
      expect(result).toBe('day')
    })

    it('should return "day" for very small azimuth values', () => {
      const result = getSunMoonStatus(0.001)
      expect(result).toBe('day')
    })
  })

  describe('night status', () => {
    it('should return "night" for azimuth 180', () => {
      const result = getSunMoonStatus(180)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth 181', () => {
      const result = getSunMoonStatus(181)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth 270', () => {
      const result = getSunMoonStatus(270)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth 359', () => {
      const result = getSunMoonStatus(359)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth 359.9', () => {
      const result = getSunMoonStatus(359.9)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth 359.999', () => {
      const result = getSunMoonStatus(359.999)
      expect(result).toBe('night')
    })

    it('should return "night" for azimuth just above 180', () => {
      const result = getSunMoonStatus(180.001)
      expect(result).toBe('night')
    })
  })

  describe('edge cases', () => {
    it('should handle negative azimuth values', () => {
      const result = getSunMoonStatus(-1)
      expect(result).toBe('night')
    })

    it('should handle azimuth values >= 360', () => {
      const result = getSunMoonStatus(360)
      expect(result).toBe('night')
    })

    it('should handle azimuth values > 360', () => {
      const result = getSunMoonStatus(361)
      expect(result).toBe('night')
    })

    it('should handle azimuth at exact boundary (180)', () => {
      const result = getSunMoonStatus(180)
      expect(result).toBe('night')
    })

    it('should handle very large azimuth values', () => {
      const result = getSunMoonStatus(1000)
      expect(result).toBe('night')
    })

    it('should handle decimal precision at boundaries', () => {
      expect(getSunMoonStatus(179.99999999)).toBe('day')
      expect(getSunMoonStatus(180.00000001)).toBe('night')
    })
  })

  describe('cardinal directions', () => {
    it('should return "day" for east (90°)', () => {
      const result = getSunMoonStatus(90)
      expect(result).toBe('day')
    })

    it('should return "night" for south (180°)', () => {
      const result = getSunMoonStatus(180)
      expect(result).toBe('night')
    })

    it('should return "night" for west (270°)', () => {
      const result = getSunMoonStatus(270)
      expect(result).toBe('night')
    })

    it('should return "day" for north (0°/360°)', () => {
      expect(getSunMoonStatus(0)).toBe('day')
    })
  })

  describe('practical scenarios', () => {
    it('should correctly identify dawn (azimuth ~0-45)', () => {
      expect(getSunMoonStatus(0)).toBe('day')
      expect(getSunMoonStatus(22.5)).toBe('day')
      expect(getSunMoonStatus(45)).toBe('day')
    })

    it('should correctly identify midday (azimuth ~90)', () => {
      expect(getSunMoonStatus(85)).toBe('day')
      expect(getSunMoonStatus(90)).toBe('day')
      expect(getSunMoonStatus(95)).toBe('day')
    })

    it('should correctly identify dusk (azimuth ~135-179)', () => {
      expect(getSunMoonStatus(135)).toBe('day')
      expect(getSunMoonStatus(157.5)).toBe('day')
      expect(getSunMoonStatus(179)).toBe('day')
    })

    it('should correctly identify evening (azimuth ~180-270)', () => {
      expect(getSunMoonStatus(180)).toBe('night')
      expect(getSunMoonStatus(225)).toBe('night')
      expect(getSunMoonStatus(270)).toBe('night')
    })

    it('should correctly identify midnight (azimuth ~270-315)', () => {
      expect(getSunMoonStatus(270)).toBe('night')
      expect(getSunMoonStatus(292.5)).toBe('night')
      expect(getSunMoonStatus(315)).toBe('night')
    })

    it('should correctly identify pre-dawn (azimuth ~315-359)', () => {
      expect(getSunMoonStatus(315)).toBe('night')
      expect(getSunMoonStatus(337.5)).toBe('night')
      expect(getSunMoonStatus(359)).toBe('night')
    })
  })
})
