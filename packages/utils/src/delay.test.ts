import { describe, it, expect, beforeEach, vi } from 'vitest'
import { delay } from './delay'

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return a promise', () => {
    const result = delay(100)
    expect(result).toBeInstanceOf(Promise)
  })

  it('should resolve after the specified time', async () => {
    const ms = 1000
    const promise = delay(ms)
    
    // Fast-forward time
    await vi.advanceTimersByTimeAsync(ms)
    
    await expect(promise).resolves.toBeUndefined()
  })

  it('should delay for 0 milliseconds', async () => {
    const promise = delay(0)
    await vi.advanceTimersByTimeAsync(0)
    await expect(promise).resolves.toBeUndefined()
  })

  it('should delay for multiple different durations', async () => {
    const delays = [100, 500, 1000, 2000]
    
    for (const ms of delays) {
      const promise = delay(ms)
      await vi.advanceTimersByTimeAsync(ms)
      await expect(promise).resolves.toBeUndefined()
    }
  })

  it('should work with real timers', async () => {
    vi.useRealTimers()
    
    const start = Date.now()
    await delay(50)
    const end = Date.now()
    
    // Allow some tolerance for timer precision
    expect(end - start).toBeGreaterThanOrEqual(45)
    expect(end - start).toBeLessThan(100)
  })

  it('should handle concurrent delays', async () => {
    vi.useRealTimers()
    
    const start = Date.now()
    await Promise.all([
      delay(50),
      delay(50),
      delay(50)
    ])
    const end = Date.now()
    
    // All should complete roughly at the same time
    expect(end - start).toBeGreaterThanOrEqual(45)
    expect(end - start).toBeLessThan(100)
  })
})
