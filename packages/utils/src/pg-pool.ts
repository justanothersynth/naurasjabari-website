import pkg from 'pg'

const { Pool } = pkg

/**
 * Creates a new Postgres connection pool for database operations
 * @param databaseUrl - The database connection string
 */
export const createPool = (databaseUrl: string) => {
  return new Pool({
    connectionString: databaseUrl
  })
}
