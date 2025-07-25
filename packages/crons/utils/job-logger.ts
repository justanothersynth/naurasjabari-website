import winston from 'winston'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'

export interface JobLogger {
  jobId: string
  logFilePath: string
  logError: (message: string, error?: Error | string) => void
  logErrorStack: (identifier: number | string, error: Error | string) => void
  cleanup: () => void
}

/**
 * Creates a job-specific logger that only logs to files when errors occur
 * @param jobName - Name of the job (used in log file naming)
 * @returns JobLogger instance with unique job ID
 */
export function createJobLogger(jobName: string): JobLogger {
  const jobId = randomUUID().substring(0, 8) // Short unique ID
  const timestamp = Date.now()
  const jobSubDir = jobName.toLowerCase().replace(/\s+/g, '-')
  const logDir = path.join(process.cwd(), 'logs', jobSubDir)
  const logFileName = `${timestamp}-${jobId}.log`
  const logFilePath = path.join(logDir, logFileName)

  let hasErrors = false
  let logger: winston.Logger | null = null

  /**
   * Initialize the winston logger (only when first error occurs)
   */
  function initializeLogger(): winston.Logger {
    if (logger) return logger

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return stack
          ? `${timestamp} [${level.toUpperCase()}] [JOB-${jobId}]: ${message}\n${stack}`
          : `${timestamp} [${level.toUpperCase()}] [JOB-${jobId}]: ${message}`
      })
    )

    logger = winston.createLogger({
      level: 'error',
      format: logFormat,
      transports: [
        new winston.transports.File({
          filename: logFilePath,
          level: 'error',
        }),
      ],
      silent: false,
    })

    // Log job start information
    logger.error(`=== Job Started: ${jobName} ===`)
    logger.error(`Job ID: ${jobId}`)
    logger.error(`Timestamp: ${new Date().toISOString()}`)
    logger.error('=====================================\n')

    return logger
  }

  /**
   * Log an error message and optional error object
   */
  function logError(message: string, error?: Error | string): void {
    hasErrors = true
    const jobLogger = initializeLogger()

    jobLogger.error(message)
    if (error) {
      if (error instanceof Error) {
        jobLogger.error(error.stack || error.message)
      } else {
        jobLogger.error(String(error))
      }
    }
  }

  /**
   * Log error stack for a specific entity
   */
  function logErrorStack(identifier: number | string, error: Error | string): void {
    hasErrors = true
    const jobLogger = initializeLogger()

    jobLogger.error(`Stack trace for ${identifier}:`)
    if (error instanceof Error) {
      jobLogger.error(error.stack || error.message)
    } else {
      jobLogger.error(String(error))
    }
  }

  /**
   * Cleanup logger and remove log file if no errors occurred
   */
  function cleanup(): void {
    if (logger) {
      // Log job completion
      logger.error(`\n=== Job Completed: ${jobName} ===`)
      logger.error(`Job ID: ${jobId}`)
      logger.error(`Timestamp: ${new Date().toISOString()}`)
      logger.error('====================================')

      logger.close()
    }

    // Remove log file if no errors occurred
    if (!hasErrors && fs.existsSync(logFilePath)) {
      try {
        fs.unlinkSync(logFilePath)
      } catch {
        // eslint-disable-next-line no-console
        console.error(`Failed to remove empty log file: ${logFilePath}`)
      }
    }
  }

  return {
    jobId,
    logFilePath,
    logError,
    logErrorStack,
    cleanup
  }
}
