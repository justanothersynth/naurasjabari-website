import type { IncomingHttpHeaders } from 'node:http'
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync, readdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { os, ORPCError } from '@orpc/server'
import { z } from 'zod'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext } from '@workspace/types'

const optionsSchema = z.object({
  format: z.enum(['png', 'ppm', 'pgm', 'pbm']).optional().default('png'),
  resolution: z.number().optional().default(144), // DPI resolution
  firstPage: z.number().optional(), // First page to convert
  lastPage: z.number().optional(), // Last page to convert
  singleFile: z.boolean().optional().default(false), // Generate single file for multi-page PDFs
  cropBox: z.boolean().optional().default(false), // Use crop box instead of media box
  gray: z.boolean().optional().default(false), // Generate grayscale images
  responseType: z.enum(['base64', 'image', 'buffer']).optional().default('buffer')
})

const inputSchema = z.object({
  fileBlob: z.instanceof(Blob),
  options: optionsSchema.default({
    format: 'png',
    resolution: 144,
    singleFile: false,
    cropBox: false,
    gray: false,
    responseType: 'buffer'
  })
})

const cleanupTempFiles = (tempDir: string): void => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

/**
 * Normalizes pdftoppm output filenames by removing leading zeros from page numbers
 * because pdftoppm inconsistently names files like so:
 * - 9 pages or less: image-1.png, image-2.png, etc.
 * - 10 pages or more: image-01.png, image-02.png, etc.
 * This function ensures consistent naming without leading zeros.
 */
const normalizeImageFilenames = (tempDir: string, format: string): void => {
  if (!existsSync(tempDir)) return
  
  const files = readdirSync(tempDir)
  const imagePattern = new RegExp(`^image-(\\d+)\\.${format}$`)
  
  for (const filename of files) {
    const match = filename.match(imagePattern)
    if (match && match[1]) {
      const pageNumberStr = match[1]
      // Check if the page number has leading zeros
      if (pageNumberStr.length > 1 && pageNumberStr.startsWith('0')) {
        const pageNumber = parseInt(pageNumberStr, 10)
        const normalizedFilename = `image-${pageNumber}.${format}`
        
        const oldPath = join(tempDir, filename)
        const newPath = join(tempDir, normalizedFilename)
        
        // Only rename if the normalized filename is different and doesn't already exist
        if (filename !== normalizedFilename && !existsSync(newPath)) {
          renameSync(oldPath, newPath)
        }
      }
    }
  }
}

const handler = async ({ input }: {
  input: z.infer<typeof inputSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  // Create temporary file paths
  const tempId = `${Date.now()}__${randomUUID()}`
  const tempDir = join(process.cwd(), `temp/convert-pdf-to-image/${tempId}`)
  mkdirSync(tempDir, { recursive: true })
  const inputPdfPath = join(tempDir, 'input.pdf')

  try {
    const { fileBlob, options } = input
    const { format, resolution, firstPage, lastPage, singleFile, cropBox, gray, responseType } = options
    
    // Use the same UUID for final output naming
    const outputPrefix = join(tempDir, 'image')

    // Save blob to temporary PDF file so that pdftoppm can read it
    const pdfBuffer = Buffer.from(await fileBlob.arrayBuffer())
    writeFileSync(inputPdfPath, pdfBuffer)

    // Build pdftoppm command
    const pdftoppmArgs = [
      'pdftoppm',
      `-${format}`, // Format flag (-png, -ppm, -pgm, -pbm)
      '-forcenum',
      '-aa', 'yes',
      '-aaVector', 'yes',
      '-r', resolution.toString() // Resolution in DPI
    ]

    // Add optional flags
    if (firstPage) {
      pdftoppmArgs.push('-f', firstPage.toString())
    }
    if (lastPage) {
      pdftoppmArgs.push('-l', lastPage.toString())
    }
    if (singleFile) {
      pdftoppmArgs.push('-singlefile')
    }
    if (cropBox) {
      pdftoppmArgs.push('-cropbox')
    }
    if (gray) {
      pdftoppmArgs.push('-gray')
    }

    // Add input file and output prefix
    pdftoppmArgs.push(inputPdfPath, outputPrefix)

    // Execute pdftoppm command
    const proc = Bun.spawnSync(pdftoppmArgs)

    if (proc.exitCode !== 0) {
      cleanupTempFiles(tempDir)
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `pdftoppm conversion failed with exit code ${proc.exitCode}`
      })
    }

    // Normalize filename format (remove leading zeros from page numbers)
    normalizeImageFilenames(tempDir, format)

    // Read the generated image files
    const results = []
    
    let pageNum = 1
    while (true) {
      const filename = singleFile ? `image.${format}` : `image-${pageNum}.${format}` // pdftoppm output format
      const tempImagePath = join(tempDir, filename)
      if (!existsSync(tempImagePath)) break
      
      const imageBuffer = readFileSync(tempImagePath)

      const result = {
        page: pageNum,
        filename,
        data: responseType === 'base64'
          ? imageBuffer.toString('base64')
          : responseType === 'buffer'
            ? imageBuffer
            : `data:image/${format};base64,${imageBuffer.toString('base64')}` // responseType === 'image'
      }
      results.push(result)
      
      // If single file mode, only one file is generated
      if (singleFile) break
      pageNum++
    }
    
    
    if (results.length === 0) {
      cleanupTempFiles(tempDir)
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'No images were generated from the PDF'
      })
    }

    return {
      status: 200,
      message: 'PDF converted to image(s) successfully',
      data: {
        results,
        totalPages: results.length,
        format,
        directoryId: tempId,
        tempDir
      }
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'convert-pdf-to-image')
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
