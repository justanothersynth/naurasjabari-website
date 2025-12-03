import { z } from 'zod'

export const configSchema = z.object({
  // Environment Configuration
  NODE_ENV: z.enum(['development', 'production', 'staging', 'test'])
    .default('development')
    .describe('Application environment'),

  SERVER_ENV: z.enum(['development', 'staging', 'production'])
    .default('development')
    .describe('Server environment'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose'])
    .default('info')
    .describe('Logging level'),

  API_URL: z.url().describe('API backend URL'),

  SUPABASE_URL: z.url().describe('Supabase project URL'),
  SUPABASE_KEY: z.string().describe('Supabase API key'),
  
  // Database Configuration
  SUPABASE_DATABASE_URL: z.string().describe('Direct Postgres database connection URL'),

  // JWT Configuration for authenticating cron jobs with Supabase
  SUPABASE_JWT_SECRET: z.string().describe('Secret key for signing internal JWTs'),
  SUPABASE_JWT_ISSUER: z.string().describe('JWT issuer'),
  SUPABASE_JWT_SUBJECT: z.string().describe('JWT subject (user identifier) for cron processes'),

  // Github Configuration
  GITHUB_PAT: z.string().optional().describe('GitHub Personal Access Token'),

  // Redis Configuration
  REDIS_HOST: z.string().describe('Redis host'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379).describe('Redis port')
})
