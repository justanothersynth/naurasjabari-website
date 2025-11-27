import type { Pool } from 'pg'
import type { Logger } from '@workspace/utils'
import { logBatchDeleted } from './log'

/**
 * Deletes azimuth records older than the cutoff date from the sun_moon table
 * @param pool - The database connection pool
 * @param cutoffDate - ISO string date to delete records before
 * @param batchSize - Number of records to delete per batch
 * @param jobLogger - Logger instance for logging
 * @returns Total number of records deleted
 */
export const deleteAzimuthRecords = async (
  pool: Pool,
  cutoffDate: string,
  batchSize: number,
  jobLogger: Logger
): Promise<number> => {
  let totalDeleted = 0
  
  while (true) {
    const result = await pool.query(
      `DELETE FROM sun_moon 
       WHERE id IN (
         SELECT id FROM sun_moon
         WHERE created_at < $1
         ORDER BY created_at
         LIMIT $2
       )`,
      [cutoffDate, batchSize]
    )

    const deletedInBatch = result.rowCount || 0
    totalDeleted += deletedInBatch

    if (deletedInBatch > 0) {
      logBatchDeleted(jobLogger, 'azimuth', deletedInBatch, totalDeleted)
    }

    // Stop if we deleted fewer records than the batch size (no more records to delete)
    if (deletedInBatch < batchSize) {
      break
    }
  }

  return totalDeleted
}
