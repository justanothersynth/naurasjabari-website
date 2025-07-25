/**
 * oRPC middleware for Express
 */

import { RPCHandler } from '@orpc/server/node'
import { onError, ORPCError } from '@orpc/server'
import { router as orpcRouter } from './router'
import { OpenAPIHandler } from '@orpc/openapi/node'
import type { Request, Response, NextFunction } from 'express'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'

const rpcHandler = new RPCHandler(orpcRouter, {
  clientInterceptors: [
    onError((error) => {
      if (error instanceof ORPCError) {
        const issues = error?.data?.issues
        if (issues) {
          throw new ORPCError('INPUT_VALIDATION_FAILED', {
            status: 422,
            data: issues
          })
        } else {
          throw error
        }
      }
    })
  ]
})

const openApiHandler = new OpenAPIHandler(orpcRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'API Playground',
          version: '1.0.0'
        }
      }
    })
  ]
})

// oRPC middleware for /orpc endpoint
// the RPCHandler used here enables communication with clients over oRPC's proprietary RPC protocol, built on top of HTTP.
// While it efficiently transfers native types, the protocol is neither human-readable nor OpenAPI-compatible
// https://orpc.unnoq.com/docs/rpc-handler
export const orpcMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { matched } = await rpcHandler.handle(req, res, {
    prefix: '/orpc',
    context: {
      headers: req.headers
    }
  })
  if (matched) {
    return
  }
  next()
}

// OpenAPI middleware for /oapi endpoint
export const apiMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { matched } = await openApiHandler.handle(req, res, {
    prefix: '/oapi',
    context: {
      headers: req.headers
    }
  })
  if (matched) {
    return
  }
  next()
}
