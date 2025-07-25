import { createClient } from '../supabase'
import type { IncomingHttpHeaders } from 'node:http'
import { os, ORPCError } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext } from '@workspace/types'

const inputSchema = z.object({
  table: z.string(),
  path: z.string(),
  isPublic: z.boolean().default(false),
  expiresIn: z.number().default(3600) // 1 hour default for signed URLs
})

const handler = async ({ input, context }: {
  input: z.infer<typeof inputSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  try {
    const supabase = createClient(context.token)
    const { table, path, isPublic, expiresIn } = input

    if (isPublic) {
      // Get public URL for public buckets
      const { data } = supabase.storage
        .from(table)
        .getPublicUrl(path)

      return {
        status: 200,
        message: 'Public URL retrieved successfully',
        data: {
          url: data.publicUrl,
          type: 'public'
        }
      }
    } else {
      // Create signed URL for private buckets
      const { data, error } = await supabase.storage
        .from(table)
        .createSignedUrl(path, expiresIn)

      if (error) {
        throw new ORPCError('BAD_REQUEST', {
          message: error.message
        })
      }

      return {
        status: 200,
        message: 'Signed URL created successfully',
        data: {
          url: data.signedUrl,
          type: 'signed',
          expiresIn
        }
      }
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'get-file-url')
  }
}

export const api = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(authorizeOrpc)
  .input(inputSchema)
  .handler(handler)

export const internal = (context: OrpcContext) =>
  os
    .$context<{ headers: IncomingHttpHeaders }>()
    .use(authorizeOrpc)
    .input(inputSchema)
    .handler(handler)
    .callable({ context })

export default {
  api,
  internal
}
