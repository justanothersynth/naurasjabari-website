import { createPool, vacuumTable, logError } from '@workspace/utils'
import { config } from '../../config'
import { createJobRunner } from '../create-job-runner'
import { deleteAzimuthRecords } from './delete-azimuth'
import { deleteGeostormRecords } from './delete-geostorm'
import { logJobStart, logJobCompleted } from './log'

/**
 * Deletes azimuth data older than 1 hour (UTC) from the sun_moon table
 * and geostorm data older than 1 month (UTC) from the geostorm table
 */
export const { job, subcommand } = createJobRunner({
  runJob: async ({ jobLogger }) => {
    logJobStart(jobLogger)

    const pool = createPool(config.supabase.databaseUrl)

    try {
      // Calculate cutoff dates
      const oneHourAgo = new Date()
      oneHourAgo.setUTCHours(oneHourAgo.getUTCHours() - 1)
      const azimuthCutoffDate = oneHourAgo.toISOString()

      const oneMonthAgo = new Date()
      oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1)
      const geostormCutoffDate = oneMonthAgo.toISOString()

      const BATCH_SIZE = 25000

      // Delete azimuth data older than 1 hour (in batches of 25,000)
      const totalAzimuthDeleted = await deleteAzimuthRecords(
        pool,
        azimuthCutoffDate,
        BATCH_SIZE,
        jobLogger
      )

      // Run VACUUM FULL and ANALYZE on sun_moon table
      if (totalAzimuthDeleted > 0) {
        await vacuumTable(pool, 'sun_moon')
      }

      // Delete geostorm data older than 1 month (in batches of 25,000)
      const totalGeostormDeleted = await deleteGeostormRecords(
        pool,
        geostormCutoffDate,
        BATCH_SIZE,
        jobLogger
      )

      // Run VACUUM FULL and ANALYZE on geostorm table
      if (totalGeostormDeleted > 0) {
        await vacuumTable(pool, 'geostorm')
      }

      logJobCompleted(
        jobLogger,
        azimuthCutoffDate,
        totalAzimuthDeleted,
        geostormCutoffDate,
        totalGeostormDeleted
      )
    } catch (error) {
      logError(jobLogger, error, 'Error in delete job')
      throw error
    } finally {
      // Always close the pool connection
      try {
        await pool.end()
      } catch (error) {
        logError(jobLogger, error, 'Error closing pool')
      }
    }
  }
})
