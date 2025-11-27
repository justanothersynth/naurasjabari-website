import * as cheerio from 'cheerio'
import { parse, format } from 'date-fns'
import type { ContributionCalendar, YearContribution } from './types'

/**
 * Parses the contribution calendar from the HTML, comparing with existing data to preserve higher values
 * @param $ - The cheerio API
 * @param existingCalendar - The existing calendar data to compare against
 * @returns The parsed contribution calendar with higher values preserved and month indices
 */
export const parseContributionCalendar = ($: cheerio.CheerioAPI, existingCalendar?: ContributionCalendar): { calendar: ContributionCalendar, monthPosition: Record<string, number> } => {
  const calendar = $('.ContributionCalendar-grid tbody')
  const rows = calendar.children()
  const len = rows.length
  const contributionCalendar: ContributionCalendar = {}
  const monthPosition: Record<string, number> = {}

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
        const contributionMatch = tooltip.match(/^(\d+) contributions/)
        const incomingCount = contributionMatch?.[1] ? parseInt(contributionMatch[1], 10) : 0
        
        // If it's the 1st of the month, record the index with 3-letter month abbreviation (date extracted from tooltip)
        // Tooltip format: "X contributions on Month Day." or "No contributions on Month Day."
        if (tooltip) {
          const dateMatch = tooltip.match(/on ([A-Za-z]+) (\d+)(?:st|nd|rd|th)\./)
          if (dateMatch && dateMatch[1] && dateMatch[2]) {
            const fullMonthName = dateMatch[1]
            const dayNumber = parseInt(dateMatch[2], 10)
            if (dayNumber === 1) {
              const tempDate = parse(`${fullMonthName} 1, 2024`, 'MMMM d, yyyy', new Date())
              const monthAbbr = format(tempDate, 'MMM')
              monthPosition[monthAbbr] = j
            }
          }
        }
        
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

  return { calendar: contributionCalendar, monthPosition }
}

/**
 * Fetches the contributions data for a given year
 * @param year - The year to fetch the contributions for
 * @param existingYearData - The existing data for this year to compare against
 * @returns The contributions data for the given year with higher values preserved
 */
export const fetchYearContributions = async (year: number, existingYearData?: YearContribution): Promise<YearContribution> => {
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
  const { calendar, monthPosition } = parseContributionCalendar($, existingYearData?.calendar)

  return {
    count: finalCount,
    calendar,
    monthPosition
  }
}
