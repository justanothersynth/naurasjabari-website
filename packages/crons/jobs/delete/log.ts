import { format } from 'date-fns'
import type { Logger } from '@workspace/utils'

export const logJobStart = (jobLogger: Logger, schedule: string) => {
  jobLogger.info('Job started: Deleting old azimuth and geostorm data', { schedule })
}

export const logBatchDeleted = (
  jobLogger: Logger,
  table: 'azimuth' | 'geostorm',
  batchDeleted: number,
  totalDeleted: number
) => {
  jobLogger.info(`Deleted ${table} records batch`, {
    batchDeleted,
    totalDeleted
  })
}

export const logJobCompleted = (
  jobLogger: Logger,
  azimuthCutoffDate: string,
  azimuthDeleted: number,
  geostormCutoffDate: string,
  geostormDeleted: number
) => {
  jobLogger.info('Deletion job completed successfully', {
    azimuthCutoff: format(new Date(azimuthCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss'),
    azimuthDeleted,
    geostormCutoff: format(new Date(geostormCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss'),
    geostormDeleted
  })
}
