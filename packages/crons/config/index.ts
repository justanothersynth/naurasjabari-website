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

// Handle validation errors
if (!parsedSchema.success) {
  const errorMessages = parsedSchema.error.errors
    .map((error) => `${error.path.join('.')}: ${error.message}`)
    .join('\n')

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
    jwtSubject: validatedEnv.SUPABASE_JWT_SUBJECT
  },
  // Github Configuration
  github: {
    pat: validatedEnv.GITHUB_PAT
  }
} as const

// TypeScript interface for the config object (inferred from Zod schema)
type Config = typeof config

// Log configuration summary (excluding sensitive data) - only when running from crons package
const shouldShowOutput = process.argv[1]?.includes('/crons/')

if (shouldShowOutput) {
  const message = `
${chalk.green('✅ Configuration loaded successfully:')}

${chalk.bold('   Node environment:')} ${chalk.cyan(config.nodeEnv)}
${chalk.bold('   Server environment:')} ${chalk.cyan(config.serverEnv)}
${chalk.bold('   API URL:')} ${chalk.cyan(config.apiUrl)}
${chalk.bold('   oRPC URL:')} ${chalk.cyan(config.apiUrl + '/orpc')}
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
