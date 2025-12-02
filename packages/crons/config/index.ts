import dotenv from 'dotenv'
import path from 'path'
import { configSchema } from './schema'
import { createLogger } from '@workspace/utils'

// Load .env file automatically
dotenv.config({
  path: path.resolve(import.meta.dirname, '../.env')
})

// Validate and transform environment variables
const parsedSchema = configSchema.safeParse(process.env)

// Handle validation errors
if (!parsedSchema.success) {
  const errorMessages = parsedSchema.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join('\n')

  // Log to console since we don't have a logger yet
  // eslint-disable-next-line no-console
  console.error('❌ Configuration validation failed:')
  // eslint-disable-next-line no-console
  console.error(errorMessages)

  process.exit(1)
}

const validatedEnv = parsedSchema.data

// Transform validated environment variables into typed config object
const config = {
  // Environment Configuration
  nodeEnv: validatedEnv.NODE_ENV,
  serverEnv: validatedEnv.SERVER_ENV,
  apiUrl: validatedEnv.API_URL,
  // Logging Configuration
  logging: {
    level: validatedEnv.LOG_LEVEL
  },
  // Supabase Configuration
  supabase: {
    url: validatedEnv.SUPABASE_URL,
    anonKey: validatedEnv.SUPABASE_KEY,
    jwtSecret: validatedEnv.SUPABASE_JWT_SECRET,
    jwtIssuer: validatedEnv.SUPABASE_JWT_ISSUER,
    jwtSubject: validatedEnv.SUPABASE_JWT_SUBJECT,
    databaseUrl: validatedEnv.SUPABASE_DATABASE_URL
  },
  // Github Configuration
  github: {
    pat: validatedEnv.GITHUB_PAT
  },
  // Redis Configuration
  redis: {
    host: validatedEnv.REDIS_HOST,
    port: validatedEnv.REDIS_PORT
  }
} as const

// TypeScript interface for the config object (inferred from Zod schema)
type Config = typeof config

// Create logger instance (job context is added via logger.withContext in each runner)
const logger = createLogger({
  name: 'crons',
  level: config.serverEnv === 'production' ? 'info' : 'debug',
  pretty: config.serverEnv !== 'production'
})

// Log configuration summary (excluding sensitive data) - only when running from crons package
const shouldShowOutput = process.argv[1]?.includes('/crons/')

if (shouldShowOutput) {
  logger.info('Configuration loaded successfully', {
    nodeEnv: config.nodeEnv,
    serverEnv: config.serverEnv,
    apiUrl: config.apiUrl,
    orpcUrl: config.apiUrl + '/orpc'
  })
}

export { config, logger }
export type { Config }
