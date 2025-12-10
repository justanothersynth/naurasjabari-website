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
        defaultSrc: [`'self'`, 'unpkg.com'], // eslint-disable-line quotes
        styleSrc: [
          `'self'`, // eslint-disable-line quotes
          `'unsafe-inline'`, // eslint-disable-line quotes
          'cdn.jsdelivr.net',
          'fonts.googleapis.com',
          'unpkg.com'
        ],
        fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'], // eslint-disable-line quotes
        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'], // eslint-disable-line quotes
        scriptSrc: [
          `'self'`, // eslint-disable-line quotes
          'https: unsafe-inline',
          'cdn.jsdelivr.net',
          `'unsafe-eval'` // eslint-disable-line quotes
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
