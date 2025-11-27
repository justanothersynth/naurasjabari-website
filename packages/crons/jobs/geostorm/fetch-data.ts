import * as cheerio from 'cheerio'
import type { GeostormOrpcInput, GeostormOrpcInputRegions } from '@workspace/types'

/**
 * Gets the table headers
 * output: [
 *  'Sub-Auroral',
 *  'Auroral',
 *  'Polar'
 * ]
 */
export const getTableHeaders = ($: cheerio.CheerioAPI) => {
  const header = [...$('#tabular-forecast').find('thead th')].map(e => {
    return $(e).text().trim()
  })
  header.shift() // remove first entry because it's emtpy
  return header
}

/**
 * Gets row headings
 * output: [
 *  '24 Hour Review',
 *  '6 Hour Review',
 *  'Current Conditions',
 *  '6 Hour Forecast',
 *  '24 Hour Forecast'
 * ]
 */
export const getRowHeadings = ($: cheerio.CheerioAPI) => {
  return [...$('#tabular-forecast').find('tbody th')].map(e => {
    return $(e).text().trim()
  })
}

/**
 * Gets row values
 * example output: ['<div>active</div>', '<div>stormy intervals</div>']
 */
export const getRowValues = ($: cheerio.CheerioAPI) => {
  return [...$('#tabular-forecast').find('tbody td')].map(e => {
    return $(e).html()
  })
}

/**
 * Initialize data fetching
 * output example:
 
  \{
    last24Hours: \{
      subAuroral: [ 'quiet', 'unsettled intervals' ],
      auroral: [ 'unsettled', 'active intervals' ],
      polar: [ 'active', 'stormy intervals' ]
    \},
    last6Hours: \{
      subAuroral: [ 'unsettled', '' ],
      auroral: [ 'quiet', 'unsettled intervals' ],
      polar: [ 'stormy', '' ]
    \},
    currentConditions: \{
      subAuroral: [ 'unsettled', '' ],
      auroral: [ 'unsettled', '' ],
      polar: [ 'stormy', '' ]
    \},
    next6Hours: \{
      subAuroral: [ 'quiet', 'unsettled intervals' ],
      auroral: [ 'quiet', 'unsettled intervals' ],
      polar: [ 'active', '' ]
    \},
    next24Hours: \{
      subAuroral: [ 'quiet', 'unsettled intervals' ],
      auroral: [ 'unsettled', '' ],
      polar: [ 'active', 'stormy intervals' ]
    \}
  \}

 */
export const fetchData = async () => {
  const response = await fetch('https://naurasjabari-website-edge.vercel.app/api/geostorm')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch geostorm data: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.text()
  let $ = cheerio.load(data)
  
  const header = getTableHeaders($)
  const rowHeadings = getRowHeadings($)
  const rowValues = getRowValues($)

  const timeHeadingMap: Record<string, string> = {
    '24 Hour Review': 'last24Hours',
    '6 Hour Review': 'last6Hours',
    'Current Conditions': 'currentConditions',
    '6 Hour Forecast': 'next6Hours',
    '24 Hour Forecast': 'next24Hours'
  }

  const locationMap: Record<string, string> = {
    'Sub-Auroral': 'subAuroral',
    Auroral: 'auroral',
    Polar: 'polar'
  }

  const output: GeostormOrpcInput = {
    last24Hours: {
      subAuroral: [],
      auroral: [],
      polar: []
    },
    last6Hours: {
      subAuroral: [],
      auroral: [],
      polar: []
    },
    currentConditions: {
      subAuroral: [],
      auroral: [],
      polar: []
    },
    next6Hours: {
      subAuroral: [],
      auroral: [],
      polar: []
    },
    next24Hours: {
      subAuroral: [],
      auroral: [],
      polar: []
    },
    activities: ''
  }

  // Populates and returns the output
  let headingIndex = 0
  let rowHeadingIndex = 0
  const len = rowValues.length
  let activities: string[] = []
  for (let i = 0; i < len; i++) {
    const row = rowValues[i]
    $ = cheerio.load(`<div class="row">${row}</div>`)
    const values = [...$('.row').find('div')].map(e => {
      return $(e).text().trim()
    })
    const rowHeading = rowHeadings[rowHeadingIndex]
    const headerValue = header[headingIndex]
    if (!rowHeading || !headerValue) continue
    const timeKey = timeHeadingMap[rowHeading] as keyof Omit<GeostormOrpcInput, 'activities'>
    const locationKey = locationMap[headerValue] as 'subAuroral' | 'auroral' | 'polar'
    (output[timeKey] as GeostormOrpcInputRegions)[locationKey] = values
    headingIndex++
    if (i > 0 && (i + 1) % 3 === 0) {
      headingIndex = 0
      rowHeadingIndex++
    }
    // Compile values into a string for the activities search vector
    activities = activities.concat(values)
    activities = activities.filter(activity => activity !== '')
  }

  output.activities = activities.join(',')

  return output
}
