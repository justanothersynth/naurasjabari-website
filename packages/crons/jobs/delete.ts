import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import type { OrpcContext } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'
import { createClient } from '@workspace/api/lib/supabase'

export const OptionsSchema = z.object({})

const orpcContext: OrpcContext = {
  headers: {}
}

let JOB_IS_RUNNING = false

/**
 * Deletes azimuth data older than 1 day (UTC) from the sun_moon table
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: delete',
      'Deleting azimuth data older than 1 day',
      'info'
    )
  )

  try {
    // Generate internal JWT for authentication
    const token = await generateInternalJWT(
      config.supabase.jwtSecret,
      config.supabase.jwtIssuer,
      config.supabase.jwtSubject
    )
    orpcContext.headers = { authorization: `Bearer ${token}` }

    // Create Supabase client
    const supabase = createClient(token)

    // Calculate the cutoff date (5 seconds ago from now in UTC)
    // const fiveSecondsAgo = new Date()
    // fiveSecondsAgo.setSeconds(fiveSecondsAgo.getSeconds() - 5)
    // const cutoffDate = fiveSecondsAgo.toISOString()

    // Calculate the cutoff date (1 day ago from now in UTC)
    const oneDayAgo = new Date()
    oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1)
    const cutoffDate = oneDayAgo.toISOString()

    // Delete records older than 1 day
    const { error, count } = await supabase
      .from('sun_moon')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    const deletedCount = count || 0
    const summary = `${Chalk.bold('Cutoff Date:')} ${cutoffDate}\n${Chalk.bold('Records Deleted:')} ${deletedCount}`

    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Delete Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in delete job:', error)
  } finally {
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'delete',
  description: 'Deletes azimuth data older than 1 day (UTC)',
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
