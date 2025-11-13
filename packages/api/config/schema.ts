import { z } from 'zod'

export const configSchema = z.object({
  // Environment Configuration
  NODE_ENV: z.enum(['development', 'production', 'staging', 'test'])
    .default('development')
    .describe('Application environment'),

  SERVER_ENV: z.enum(['development', 'staging', 'production'])
    .default('development')
    .describe('Server environment'),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000)
    .describe('Server port number'),

  API_URL: z.string().url().describe('API backend URL'),

  NGROK_URL: z.string().url().optional().describe('NGROK URL'),

  // CORS Configuration
  CORS_ORIGINS: z.string()
    .describe('Comma-separated list of allowed CORS origins'),

  // JWT Configuration
  JWT_SECRET: z.string()
    .min(32)
    .default('your-secret-key-change-this-in-production-environment')
    .describe('JWT signing secret (min 32 characters)'),

  JWT_EXPIRES_IN: z.string()
    .regex(/^\d+[smhd]$/)
    .default('24h')
    .describe('JWT token expiration time (e.g., 24h, 7d)'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose'])
    .default('info')
    .describe('Logging level'),

  // Supabase Configuration
  SUPABASE_URL: z.string().url().describe('Supabase project URL'),
  SUPABASE_KEY: z.string().describe('Supabase API key'),

  // JWT Configuration for authenticating cron jobs with Supabase
  SUPABASE_JWT_SECRET: z.string()
    .describe('Secret key for signing internal JWTs'),
  SUPABASE_JWT_ISSUER: z.string().describe('JWT issuer'),
  SUPABASE_JWT_SUBJECT: z.string()
    .describe('JWT subject (user identifier) for cron processes')
})
