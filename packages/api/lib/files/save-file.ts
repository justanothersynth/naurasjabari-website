import { promises as fs } from 'fs'
import { dirname } from 'path'
import type { IncomingHttpHeaders } from 'node:http'
import { os } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext } from '@workspace/types'

const inputSchema = z.object({
  filePath: z.string(),
  content: z.string(),
  encoding: z.enum(['base64', 'utf8', 'binary']).optional().default('base64')
})

const handler = async ({
  input
}: {
  input: z.infer<typeof inputSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  try {
    const { filePath, content, encoding } = input

    // Ensure the directory exists
    const dir = dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    // Write the file
    await fs.writeFile(filePath, content, encoding)

    return {
      status: 200,
      message: 'File saved successfully',
      data: {
        filePath,
        encoding
      }
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'save-file')
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
