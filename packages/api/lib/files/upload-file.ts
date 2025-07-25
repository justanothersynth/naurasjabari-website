import { createClient } from '../supabase'
import type { IncomingHttpHeaders } from 'node:http'
import { randomUUID } from 'crypto'
import { os, ORPCError } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext } from '@workspace/types'

const inputSchema = z.object({
  file: z.instanceof(File),
  fileName: z.string().optional()
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

    const { file, fileName } = input
    const finalFileName = fileName || file.name

    if (!file) {
      throw new ORPCError('BAD_REQUEST', {
        message: 'No file provided'
      })
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    // Generate unique file path with UUID
    const fileUuid = randomUUID()
    const filePath = `${context.user.sub}/${fileUuid}`

    // Upload to storage bucket
    const { data: storageData, error } = await supabase.storage
      .from('ingest-user-uploads')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      throw new ORPCError('BAD_REQUEST', {
        message: error.message
      })
    }

    return {
      status: 200,
      message: 'File uploaded successfully',
      data: {
        storage: storageData,
        fileName: fileUuid,
        originalFileName: finalFileName
      }
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'upload-file')
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
