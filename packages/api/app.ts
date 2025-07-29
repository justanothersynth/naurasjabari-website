/* eslint-disable no-console */
/**
 * Initialize API
 * @note Environment variables are loaded from .env file automatically in ./config/index.ts
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'

import { config, logConfigToConsole } from './config/index'
import { logger } from './utils/logger'
import { orpcMiddleware, apiMiddleware } from './orpc/express'
import fs from 'fs'
import boxen from 'boxen'
import chalk from 'chalk'

const app = express()
const port = config.port

// Security middleware
// * note: helmet options are required in order for the OpenAPI playground to be rendered properly
// ref: https://github.com/scalar/scalar/issues/727#issuecomment-1869162960
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self', 'unpkg.com'],
        styleSrc: [
          'self',
          'unsafe-inline',
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
          'unpkg.com'
        ],
        fontSrc: ['self', 'fonts.gstatic.com', 'data:'],
        imgSrc: ['self', 'data:', 'cdn.jsdelivr.net'],
        scriptSrc: [
          'self',
          'https: unsafe-inline',
          'cdn.jsdelivr.net',
          'unsafe-eval'
        ]
      }
    }
  })
)

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
)

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  })
)

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Routes
app.use('/orpc', orpcMiddleware)
app.use('/oapi', apiMiddleware)

// Serve static CSV downloads
app.use(
  '/downloads',
  express.static(path.join(__dirname, 'static/downloads'), {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
    }
  })
)

app.use('/data', express.static(path.join(__dirname, 'static/data')))

// Serve base endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success'
  })
})

app.get('/', (_req, res) => {
  res.status(200).send('🤖')
})

/**
 * Log a notice if HTTPS certificates are not found for development mode
 * @returns void
 */
function logHttpsNotice() {
  if (config.nodeEnv !== 'development') return
  const keyPath = path.join(__dirname, '../../localhost_key.pem')
  const certPath = path.join(__dirname, '../../localhost_cert.pem')

  try {
    fs.readFileSync(keyPath)
    fs.readFileSync(certPath)
  } catch {
    logger.error('❌ HTTPS certificates are required for development mode')
    logger.error('Certificate files not found at:')
    logger.error(`  Key: ${keyPath}`)
    logger.error(`  Cert: ${certPath}`)
    logger.error('Please run the mkcert setup as described in the README')
    process.exit(1)
  }
}

logHttpsNotice()

app.listen(port, () => {
  logConfigToConsole()

  console.log(
    boxen(
      `
    ${chalk.green('🚀 API server is running')}
    ${chalk.bold('   Health check:')} ${chalk.cyan.underline(
      config.apiUrl + '/health'
    )}
    ${chalk.bold('   ORPC endpoint:')} ${chalk.cyan.underline(
      config.apiUrl + '/orpc'
    )}
    ${chalk.bold('   OpenAPI endpoint:')} ${chalk.cyan.underline(
      config.apiUrl + '/oapi'
    )}
    `,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'gray'
      }
    )
  )
})
