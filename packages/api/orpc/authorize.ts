import { jwtVerify } from 'jose'
import { ORPCError } from '@orpc/server'
import type { IncomingHttpHeaders } from 'node:http'

import { config } from '../config'

const verifyCustomJWT = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(config.supabase.jwtSecret)
    const { payload } = await jwtVerify(token, secret)
  
  // Validate that this is a machine token with expected claims
  if (payload.iss === config.supabase.jwtIssuer && payload.sub && payload.role === 'authenticated') {
    return {
      sub: payload.sub,
      iss: payload.iss,
      role: payload.role
    }
    } else {
      throw new Error('Invalid machine token claims')
    }
  } catch {
    return null
  }
}

export const authorizeOrpc = async ({ context, next }: {
  context: { headers: IncomingHttpHeaders }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: (opts?: { context?: any }) => any
}) => {
  const authHeader = context.headers.authorization
  const token = authHeader?.split(' ')[1]
  if (!token) {
    throw new ORPCError('Unauthorized')
  }

  const machineUser = await verifyCustomJWT(token)
  if (machineUser) {
    return next({ context: { user: machineUser, token, authType: 'machine' } })
  }

  throw new ORPCError('Unauthorized')
}
