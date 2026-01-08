import { readFile } from 'node:fs/promises'
import { resolve, basename } from 'node:path'
import { defineEventHandler, setHeader, createError, getQuery } from 'h3'

/**
 * Serves resume PDF files with proper headers to force browser download.
 * Accepts a filename query parameter to determine which PDF to serve.
 * Sets Content-Disposition: attachment to prevent inline preview and ensure
 * the file downloads directly to the user's device.
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const filename = query.filename as string
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || typeof filename !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Filename is required'
      })
    }
    
    // Only allow specific filenames
    const allowedFiles = ['naurasjabari-resume.pdf', 'naurasjabari-resume-bw.pdf']
    if (!allowedFiles.includes(filename)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid filename'
      })
    }
    
    const filePath = resolve('./public/resume', filename)
    const fileBuffer = await readFile(filePath)
    
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="${basename(filename)}"`)
    setHeader(event, 'Content-Length', fileBuffer.length)
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    
    return fileBuffer
  } catch (error: unknown) {
    // If it's already a createError, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    // Otherwise, it's a file read error
    throw createError({
      statusCode: 404,
      statusMessage: 'Resume file not found'
    })
  }
})
