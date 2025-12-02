import { logError } from '@workspace/utils'
import { createJobRunner } from '../create-job-runner'
import { fetchData } from './fetch-data'
import { writeData } from './write-data'
import { logJobStart, logJobSuccess } from './log'

/**
 * Scrapes the geostorm data from the government of Canada
 * @link https://naurasjabari-website-edge.vercel.app/api/geostorm fetches from 👇
 * @link https://www.spaceweather.gc.ca/forecast-prevision/short-court/zone-en.php
 */
export const { job, subcommand } = createJobRunner({
  runJob: async ({ jobLogger }) => {
    logJobStart(jobLogger)

    try {
      const data = await fetchData()
      await writeData(data)
      logJobSuccess(jobLogger, data)
    } catch (error) {
      logError(jobLogger, error, 'Error in geostorm job')
      throw error
    }
  }
})
