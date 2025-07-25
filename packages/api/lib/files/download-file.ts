import { createClient } from '../supabase'
import type { IncomingHttpHeaders } from 'node:http'
import { os, ORPCError } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext } from '@workspace/types'

const inputSchema = z.object({
  table: z.string(),
  path: z.string()
})

const handler = async ({
  input,
  context
}: {
  input: z.infer<typeof inputSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  try {
    const supabase = createClient(context.token)

    const { table, path } = input

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(table)
      .download(path)

    if (downloadError) {
      throw new ORPCError('BAD_REQUEST', {
        message: downloadError.message
      })
    }

    return {
      status: 200,
      message: 'File downloaded successfully',
      data: fileBlob
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'download-file')
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
