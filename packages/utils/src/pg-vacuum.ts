import type { Pool } from 'pg'

/**
 * Runs VACUUM FULL and ANALYZE on a table to reclaim space and update statistics
 * @param pool - The database connection pool
 * @param tableName - The name of the table to vacuum
 */
export const vacuumTable = async (pool: Pool, tableName: string) => {
  await pool.query(`VACUUM FULL ${tableName}`)
  await pool.query(`ANALYZE ${tableName}`)
}
