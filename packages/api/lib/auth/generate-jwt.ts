import type { IncomingHttpHeaders } from 'node:http'
import { os } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import { config } from '../../config'
import type { OrpcContext } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'

const inputSchema = z.object({
  jwtSubject: z.string().optional()
})

const outputSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    jwt: z.string(),
    expiresIn: z.string().default(config.jwt.expiresIn)
  })
})

/**
 * Generate a JWT token for internal authentication against Supabase
 */
const handler = async ({ input, context: _context }: {
  input: z.infer<typeof inputSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  try {
    const subject = input.jwtSubject || config.supabase.jwtSubject

    const jwt = await generateInternalJWT(
      config.supabase.jwtSecret,
      config.supabase.jwtIssuer,
      subject
    )

    return {
      status: 200,
      message: 'JWT generated successfully',
      data: {
        jwt,
        expiresIn: config.jwt.expiresIn
      }
    }
  } catch (error: unknown) {
    return throwError(error, 'INTERNAL_SERVER_ERROR', 'generate-jwt')
  }
}

export const api = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(authorizeOrpc)
  .input(inputSchema)
  .output(outputSchema)
  .handler(handler)

export const internal = (context: OrpcContext) =>
  os
    .$context<{ headers: IncomingHttpHeaders }>()
    .use(authorizeOrpc)
    .input(inputSchema)
    .output(outputSchema)
    .handler(handler)
    .callable({ context })
