import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import { delay } from '@workspace/utils'
import * as cheerio from 'cheerio'
import * as fs from 'fs/promises'
import * as path from 'path'

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

type ContributionCalendar = Record<string, ({ level: number, tooltip: string, count: number } | null)[]>
interface YearContribution { count: number, calendar: ContributionCalendar }
type ContributionsByYear = Record<string, YearContribution>

/**
 * Loads existing contribution data from the JSON file
 * @returns The existing contributions data or empty object if file doesn't exist
 */
const loadExistingContributionsData = async (): Promise<ContributionsByYear> => {
  try {
    const outputPath = path.join(process.cwd(), '../api/static/data')
    const outputFile = path.join(outputPath, 'github-contrib-total.json')
    const data = await fs.readFile(outputFile, 'utf-8')
    return JSON.parse(data) as ContributionsByYear
  } catch {
    // File doesn't exist or is invalid, return empty object
    return {}
  }
}

/**
 * Parses the contribution calendar from the HTML, comparing with existing data to preserve higher values
 * @param $ - The cheerio API
 * @param existingCalendar - The existing calendar data to compare against
 * @returns The parsed contribution calendar with higher values preserved
 */
const parseContributionCalendar = ($: cheerio.CheerioAPI, existingCalendar?: ContributionCalendar): ContributionCalendar => {
  const calendar = $('.ContributionCalendar-grid tbody')
  const rows = calendar.children()
  const len = rows.length
  const contributionCalendar: ContributionCalendar = {}

  for (let i = 0; i < len; i++) {
    const row = $(rows).eq(i)
    const day = row.find('td.ContributionCalendar-label span[aria-hidden=true]').text().trim()
    const cells = row.find('td:not(.ContributionCalendar-label)')
    const cellsLen = cells.length

    for (let j = 0; j < cellsLen; j++) {
      const cell = $(cells).eq(j)
      const id = cell.attr('id')
      const tooltip = $('html').find(`tool-tip[for=${id}]`).html()
      const level = parseInt(cell.attr('data-level') || '0')
      
      if (!contributionCalendar[day]) {
        contributionCalendar[day] = []
      }
      
      if (!id || !tooltip) {
        contributionCalendar[day].push(null)
      } else {
        // Extract contribution count from tooltip text
        // Format: "12 contributions on January 25th." or "No contributions on January 18th."
        const contributionMatch = tooltip?.match(/^(\d+) contributions/)
        const incomingCount = contributionMatch?.[1] ? parseInt(contributionMatch[1], 10) : 0
        
        // Check if we have existing data for this position
        const existingEntry = existingCalendar?.[day]?.[j]
        const existingCount = existingEntry?.count || 0
        
        // Use the higher count value
        const finalCount = Math.max(existingCount, incomingCount)
        
        contributionCalendar[day].push({
          level,
          tooltip: tooltip || '',
          count: finalCount
        })
      }
    }
  }

  return contributionCalendar
}

/**
 * Fetches the contributions data for a given year
 * @param year - The year to fetch the contributions for
 * @param existingYearData - The existing data for this year to compare against
 * @returns The contributions data for the given year with higher values preserved
 */
const fetchYearContributions = async (year: number, existingYearData?: YearContribution): Promise<YearContribution> => {
  const fromDate = `${year}-01-01`
  const toDate = `${year}-12-31`
  const url = `https://github.com/users/timelytree/contributions?from=${fromDate}&to=${toDate}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.text()
  const $ = cheerio.load(data)

  // Extract contribution count from the HTML
  const contributionText = $('#js-contribution-activity-description').text().trim()
  const contributionMatch = contributionText.match(/^([\d,]+)\s+contributions/)
  const incomingCount = contributionMatch?.[1] ? parseInt(contributionMatch[1].replace(/,/g, ''), 10) : 0

  // Use the higher count between existing and incoming
  const existingCount = existingYearData?.count || 0
  const finalCount = Math.max(existingCount, incomingCount)

  // Extract the contribution calendar from the HTML, comparing with existing data
  const calendar = parseContributionCalendar($, existingYearData?.calendar)

  return {
    count: finalCount,
    calendar
  }
}

/**
 * Saves the contributions data to a file
 * @param contributionsByYear - The contributions data to save
 */
const saveContributionsDataToFile = async (contributionsByYear: ContributionsByYear): Promise<void> => {
  const outputPath = path.join(process.cwd(), '../api/static/data')
  const outputFile = path.join(outputPath, 'github-contrib-total.json')
  await fs.mkdir(outputPath, { recursive: true })
  await fs.writeFile(outputFile, JSON.stringify(contributionsByYear))
}

/**
 * Scrapes the github contributions calendar for a user and saves the data to a file
 * @link https://github.com/users/timelytree/contributions
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  try {
    const startYear = 2015
    const currentYear = new Date().getFullYear()
    
    /* eslint-disable-next-line no-console */
    console.log(
      createLogBox(
        '🚀 Job: github-contributions',
        `Fetching contribution calendar from ${startYear} to ${currentYear}`,
        'info'
      )
    )

    // Load existing data
    const existingData = await loadExistingContributionsData()

    let summary = ''
    let totalContributions = 0
    const contributionsByYear: ContributionsByYear = {}

    try {
      for (let year = startYear; year <= currentYear; year++) {
        try {
          const existingYearData = existingData[year.toString()]
          const yearData = await fetchYearContributions(year, existingYearData)
          
          totalContributions += yearData.count
          summary += `${Chalk.bold(year)}: ${yearData.count}\n`
          contributionsByYear[year.toString()] = yearData

          // Add a delay between requests to be respectful to GitHub's servers
          if (year < currentYear) {
            await delay(2000)
          }
          
        } catch {
          summary += `${Chalk.bold(year)}: ${Chalk.red('❌ failed')}\n`
          // Use existing data if available, otherwise use empty data
          contributionsByYear[year.toString()] = existingData[year.toString()] || {
            count: 0,
            calendar: {}
          }
          continue
        }
      }
      
      summary += `\n🎯 Total contributions: ${totalContributions.toLocaleString()}`
      
      /* eslint-disable-next-line no-console */
      console.log(createLogBox('GitHub Contributions Summary', summary, 'success'))

      // Save contribution totals data to JSON file
      await saveContributionsDataToFile(contributionsByYear)
      
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('❌ Error in GitHub contributions job:', error)
    }
    JOB_IS_RUNNING = false
  } finally {
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'github-contrib',
  description: 'Fetches GitHub contributions',
  optionsSchema: OptionsSchema,
  async run() {
    if (config.nodeEnv === 'development') {
      runJob()
      cron.schedule('0 0 * * *', () => runJob())
    } else {
      runJob()
    }
  }
}

export const subcommand = new Command(job.name)
  .description(job.description)
  .action(() => job.run())
