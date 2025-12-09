import type { Logger } from '@workspace/utils'
import type { GeostormOrpcInput, GeostormOrpcInputRegions } from '@workspace/types'

export const logJobStart = (jobLogger: Logger, schedule: string) => {
  jobLogger.info('Job started: Scraping geostorm data from government of Canada', { schedule })
}

export const logJobSuccess = (jobLogger: Logger, data: GeostormOrpcInput) => {
  const currentTime = new Date()
  jobLogger.info('Geostorm data fetched successfully', {
    date: currentTime.toISOString()
  })
  
  const timeframePrettyNames = {
    'last24Hours': 'Last 24 Hours',
    'last6Hours': 'Last 6 Hours',
    'currentConditions': 'Current Conditions',
    'next6Hours': 'Next 6 Hours',
    'next24Hours': 'Next 24 Hours'
  }
  
  // Log details for each timeframe
  for (const [timeframe, timeframeName] of Object.entries(timeframePrettyNames)) {
    const timeframeData = data[timeframe as keyof GeostormOrpcInput] as GeostormOrpcInputRegions
    
    jobLogger.info(`Geostorm data timeframe (${timeframeName})`, {
      timeframe: timeframeName,
      subAuroral: timeframeData.subAuroral.filter((a: string) => a !== '').join(' → ') || timeframeData.subAuroral[0],
      auroral: timeframeData.auroral.filter((a: string) => a !== '').join(' → ') || timeframeData.auroral[0],
      polar: timeframeData.polar.filter((a: string) => a !== '').join(' → ') || timeframeData.polar[0]
    })
  }
}
