import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createLogger } from './logger'

describe('logger utility', () => {
  describe('createLogger', () => {
    it('should create a Logger instance with default config', () => {
      const logger = createLogger()
      
      expect(logger).toBeDefined()
      expect(logger).toHaveProperty('debug')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('flush')
      expect(logger).toHaveProperty('withContext')
    })

    it('should accept custom level and name', () => {
      const logger = createLogger({
        level: 'debug',
        name: 'test-logger'
      })

      expect(logger).toBeDefined()
    })

    it('should accept pretty option', () => {
      const logger = createLogger({
        level: 'info',
        name: 'test-logger',
        pretty: true
      })

      expect(logger).toBeDefined()
    })

    it('should work without pretty option (production mode)', () => {
      const logger = createLogger({
        level: 'info',
        name: 'test-logger',
        pretty: false
      })

      expect(logger).toBeDefined()
    })
  })

  describe('Logger', () => {
    let logger: ReturnType<typeof createLogger>
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let pinoSpy: any
    /* eslint-enable @typescript-eslint/no-explicit-any */

    beforeEach(() => {
      logger = createLogger()
      // Spy on the internal pino logger methods
      pinoSpy = {
        // @ts-expect-error - accessing private property for testing
        debug: vi.spyOn(logger.logger, 'debug').mockImplementation(() => { /* empty */ }),
        // @ts-expect-error - accessing private property for testing
        info: vi.spyOn(logger.logger, 'info').mockImplementation(() => { /* empty */ }),
        // @ts-expect-error - accessing private property for testing
        warn: vi.spyOn(logger.logger, 'warn').mockImplementation(() => { /* empty */ }),
        // @ts-expect-error - accessing private property for testing
        error: vi.spyOn(logger.logger, 'error').mockImplementation(() => { /* empty */ })
      }
    })

    afterEach(() => {
      pinoSpy.debug.mockRestore()
      pinoSpy.info.mockRestore()
      pinoSpy.warn.mockRestore()
      pinoSpy.error.mockRestore()
    })

    it('should call pino debug when debug is called', () => {
      logger.debug('test message')
      expect(pinoSpy.debug).toHaveBeenCalledWith({}, 'test message')
    })

    it('should call pino info when info is called', () => {
      logger.info('test message')
      expect(pinoSpy.info).toHaveBeenCalledWith({}, 'test message')
    })

    it('should call pino warn when warn is called', () => {
      logger.warn('test message')
      expect(pinoSpy.warn).toHaveBeenCalledWith({}, 'test message')
    })

    it('should call pino error when error is called', () => {
      logger.error('test message')
      expect(pinoSpy.error).toHaveBeenCalledWith({}, 'test message')
    })

    it('should include context in log output', () => {
      logger.info('test message', { user_id: '123' })
      expect(pinoSpy.info).toHaveBeenCalledWith({ user_id: '123' }, 'test message')
    })

    it('should support withContext and merge contexts', () => {
      const contextLogger = logger.withContext({ session_id: 'sess_123' })
      contextLogger.info('test message', { action: 'click' })
      expect(pinoSpy.info).toHaveBeenCalledWith({ session_id: 'sess_123', action: 'click' }, 'test message')
    })

    it('should merge multiple contexts correctly', () => {
      const contextLogger1 = logger.withContext({ session_id: 'sess_123' })
      const contextLogger2 = contextLogger1.withContext({ user_id: 'user_456' })
      contextLogger2.info('test message', { action: 'click' })
      expect(pinoSpy.info).toHaveBeenCalledWith({
        session_id: 'sess_123',
        user_id: 'user_456',
        action: 'click'
      }, 'test message')
    })
  })
})
