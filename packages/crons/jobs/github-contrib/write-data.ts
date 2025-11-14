import * as fs from 'fs/promises'
import * as path from 'path'
import type { ContributionsByYear } from './types'

/**
 * Loads existing contribution data from the JSON file
 * @param filePath - Optional file path to load data from (defaults to production path)
 * @returns The existing contributions data or empty object if file doesn't exist
 */
export const loadExistingContributionsData = async (filePath?: string): Promise<ContributionsByYear> => {
  try {
    const outputFile = filePath || path.join(import.meta.dirname, '../../../api/static/data/github-contrib-total.json')
    const data = await fs.readFile(outputFile, 'utf-8')
    return JSON.parse(data) as ContributionsByYear
  } catch {
    // File doesn't exist or is invalid, return empty object
    return {}
  }
}

/**
 * Saves the contributions data to a file
 * @param contributionsByYear - The contributions data to save
 * @param filePath - Optional file path to save data to (defaults to production path), mainly used for testing
 */
export const saveContributionsDataToFile = async (contributionsByYear: ContributionsByYear, filePath?: string): Promise<void> => {
  const outputFile = filePath || path.join(import.meta.dirname, '../../../api/static/data/github-contrib-total.json')
  const outputPath = path.dirname(outputFile)
  await fs.mkdir(outputPath, { recursive: true })
  await fs.writeFile(outputFile, JSON.stringify(contributionsByYear))
}
