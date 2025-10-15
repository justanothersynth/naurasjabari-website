import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { configSchema } from './schema'
import chalk from 'chalk'
import boxen from 'boxen'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file automatically
dotenv.config({
  path: path.resolve(__dirname, '../.env')
})

// Validate and transform environment variables
const parsedSchema = configSchema.safeParse(process.env)

// Handle schema validation errors
if (!parsedSchema.success) {
  const errorMessages = parsedSchema.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join('\n')
  /* eslint-disable no-console */
  console.error('❌ Configuration validation failed:')
  console.error(errorMessages)
  /* eslint-enable no-console */
  process.exit(1)
}

const validatedEnv = parsedSchema.data

// Transform validated environment variables into typed config object
const config = {
  // Server Configuration
  nodeEnv: validatedEnv.NODE_ENV,
  serverEnv: validatedEnv.SERVER_ENV,
  port: validatedEnv.PORT,
  apiUrl: validatedEnv.API_URL,
  ngrokUrl: validatedEnv.NGROK_URL,

  // CORS Configuration
  corsOrigins: validatedEnv.CORS_ORIGINS.split(',').map((origin: string) =>
    origin.trim()
  ),

  // JWT Configuration
  jwt: {
    secret: validatedEnv.JWT_SECRET,
    expiresIn: validatedEnv.JWT_EXPIRES_IN
  },

  // Logging Configuration
  logging: {
    level: validatedEnv.LOG_LEVEL
  },

  // Supabase Configuration
  supabase: {
    url: validatedEnv.SUPABASE_URL,
    apiKey: validatedEnv.SUPABASE_KEY,
    jwtSecret: validatedEnv.SUPABASE_JWT_SECRET,
    jwtIssuer: validatedEnv.SUPABASE_JWT_ISSUER,
    jwtSubject: validatedEnv.SUPABASE_JWT_SUBJECT
  }
} as const

// TypeScript interface for the config object (inferred from Zod schema)
type Config = typeof config

// Function to log configuration summary (excluding sensitive data)
export function logConfigToConsole() {
  const message = `
${chalk.green('✅ Configuration loaded successfully:')}

${chalk.bold('   Node environment:')} ${chalk.cyan(config.nodeEnv)}
${chalk.bold('   Server environment:')} ${chalk.cyan(config.serverEnv)}
${chalk.bold('   Port:')} ${chalk.cyan(config.port)}
${chalk.bold('   Base URL:')} ${chalk.cyan(config.apiUrl)}
${chalk.bold('   CORS Origins:')} ${chalk.cyan(config.corsOrigins)}
${chalk.bold('   Log Level:')} ${chalk.cyan(config.logging.level)}
`

  // eslint-disable-next-line no-console
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'classic',
      borderColor: 'gray'
    })
  )
}

export { config }
export type { Config }
