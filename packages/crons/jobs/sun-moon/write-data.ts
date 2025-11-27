import * as fs from 'fs/promises'
import * as path from 'path'
import type { SunResponse, MoonResponse } from '@workspace/types'

/**
 * Writes sun and moon data to JSON files
 * @param sunData - The sun data to write
 * @param moonData - The moon data to write
 * @param outputDir - The directory path where files will be saved
 */
export const writeData = async (
  sunData: Record<string, SunResponse>,
  moonData: Record<string, MoonResponse>,
  outputDir: string
) => {
  // Ensure the output directory exists
  const staticDataDir = path.isAbsolute(outputDir) ? outputDir : path.join(import.meta.dirname, '../..', outputDir)
  await fs.mkdir(staticDataDir, { recursive: true })

  // Save sun data
  const sunOutputPath = path.join(staticDataDir, 'sun.json')
  await fs.writeFile(sunOutputPath, JSON.stringify(sunData, null, 2), 'utf8')

  // Save moon data
  const moonOutputPath = path.join(staticDataDir, 'moon.json')
  await fs.writeFile(moonOutputPath, JSON.stringify(moonData, null, 2), 'utf8')
}
