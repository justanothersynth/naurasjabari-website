import pino from 'pino'

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error'
  name?: string
  pretty?: boolean
}

export type LogContext = Record<string, string | number | boolean | null | undefined>

/**
 * Wrapper class for Pino logger with context support
 */
export class Logger {
  private logger: pino.Logger
  private context: LogContext

  constructor(logger: pino.Logger, context: LogContext = {}) {
    this.logger = logger
    this.context = context
  }

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.context, ...context }
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.mergeContext(context), message)
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.mergeContext(context), message)
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.mergeContext(context), message)
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(this.mergeContext(context), message)
  }

  withContext(context: LogContext): Logger {
    const mergedContext = { ...this.context, ...context }
    return new Logger(this.logger, mergedContext)
  }

  flush(): void {
    this.logger.flush()
  }
}

/**
 * Creates a Pino logger instance with the provided configuration
 *
 * @param config - Configuration object containing optional level, name, and pretty
 * @link https://getpino.io/
 * @returns A Logger instance
 *
 * @example
 * ```ts
 * // Production: fast JSON logging
 * const logger = createLogger({
 *   level: 'info',
 *   name: 'my-app'
 * })
 *
 * // Development: pretty formatted output
 * const logger = createLogger({
 *   level: 'debug',
 *   name: 'my-app',
 *   pretty: true
 * })
 *
 * logger.info('User logged in', { user_id: '12345' })
 *
 * // Use context for related logs
 * const sessionLogger = logger.withContext({ session_id: 'sess_123' })
 * sessionLogger.info('Processing request', { action: 'purchase' })
 * ```
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  const pinoLogger = pino({
    level: config.level ?? 'info',
    name: config.name,
    ...(config.pretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    })
  })
  return new Logger(pinoLogger)
}
