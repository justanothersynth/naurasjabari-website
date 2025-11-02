import Chalk from 'chalk'
import {
  createLogBox
} from '../utils'

import { z } from 'zod'
import cron from 'node-cron'
import { Command } from 'commander'
import type { Job } from './job.types'
import { config } from '../config'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'

export const OptionsSchema = z.object({})

let JOB_IS_RUNNING = false

/**
 * Deletes azimuth data older than 1 day (UTC) from the sun_moon table
 * and geostorm data older than 1 month (UTC) from the geostorm table
 */
const runJob = async () => {
  if (JOB_IS_RUNNING) return
  JOB_IS_RUNNING = true

  /* eslint-disable-next-line no-console */
  console.log(
    createLogBox(
      '🚀 Job: delete',
      'Deleting azimuth data older than 1 day and geostorm data older than 1 month',
      'info'
    )
  )

  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )

    // Calculate cutoff dates
    const oneDayAgo = new Date()
    oneDayAgo.setUTCDate(oneDayAgo.getUTCDate() - 1)
    const azimuthCutoffDate = oneDayAgo.toISOString()

    const oneMonthAgo = new Date()
    oneMonthAgo.setUTCMonth(oneMonthAgo.getUTCMonth() - 1)
    const geostormCutoffDate = oneMonthAgo.toISOString()

    // Delete azimuth data older than 1 day (in batches of 25,000)
    let totalAzimuthDeleted = 0
    const BATCH_SIZE = 25000
    
    while (true) {
      const { error: azimuthError, data: azimuthCount } = await supabase
        .rpc('delete_old_sun_moon_batch', {
          cutoff: azimuthCutoffDate,
          batch_size: BATCH_SIZE
        })

      if (azimuthError) {
        throw new Error(`Supabase error (azimuth): ${azimuthError.message}`)
      }

      const deletedInBatch = azimuthCount || 0
      totalAzimuthDeleted += deletedInBatch

      // Stop if we deleted fewer records than the batch size (no more records to delete)
      if (deletedInBatch < BATCH_SIZE) {
        break
      }
    }

    // Delete geostorm data older than 1 month (in batches of 25,000)
    let totalGeostormDeleted = 0
    
    while (true) {
      const { error: geostormError, data: geostormCount } = await supabase
        .rpc('delete_old_geostorm_batch', {
          cutoff: geostormCutoffDate,
          batch_size: BATCH_SIZE
        })

      if (geostormError) {
        throw new Error(`Supabase error (geostorm): ${geostormError.message}`)
      }

      const deletedInBatch = geostormCount || 0
      totalGeostormDeleted += deletedInBatch

      // Stop if we deleted fewer records than the batch size (no more records to delete)
      if (deletedInBatch < BATCH_SIZE) {
        break
      }
    }

    const azimuthDeleted = totalAzimuthDeleted
    const geostormDeleted = totalGeostormDeleted
    
    const summary = `${Chalk.bold('Azimuth')}\n` +
      `Cutoff: ${format(new Date(azimuthCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss')} UTC\n` +
      `Deleted: ${azimuthDeleted} record${azimuthDeleted === 1 ? '' : 's'}\n\n` +
      `${Chalk.bold('Geostorm')}\n` +
      `Cutoff: ${format(new Date(geostormCutoffDate), 'MMM dd, yyyy \'at\' HH:mm:ss')} UTC\n` +
      `Deleted: ${geostormDeleted} record${geostormDeleted === 1 ? '' : 's'}`

    /* eslint-disable-next-line no-console */
    console.log(createLogBox('Data Deletion Summary', summary, 'success'))

  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('❌ Error in delete job:', error)
  } finally {
    JOB_IS_RUNNING = false
  }
}

const job: Job = {
  name: 'delete',
  description: 'Deletes azimuth data older than 1 day and geostorm data older than 1 month',
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
