// Job registry - metadata only, no imports to avoid loading all workers
// This allows dynamic imports to load only the requested job

const jobsDir = import.meta.dirname

export interface JobMetadata {
  name: string
  description: string
  modulePath: string
  cronPattern: string
}

export const jobRegistry: JobMetadata[] = [
  {
    name: 'azimuth',
    description: 'Creates per-second azimuth data',
    modulePath: `${jobsDir}/azimuth`,
    cronPattern: '* * * * * *' // every second
  },
  {
    name: 'sun-moon',
    description: 'Fetches sun and moon data from The Norwegian Meteorological Institute',
    modulePath: `${jobsDir}/sun-moon`,
    cronPattern: '0 0 * * *' // every day at midnight
  },
  {
    name: 'geostorm',
    description: 'Fetches geostorm data from the government of Canada',
    modulePath: `${jobsDir}/geostorm`,
    cronPattern: '0 */6 * * *' // every 6 hours
  },
  {
    name: 'github-contrib',
    description: 'Fetches GitHub contributions',
    modulePath: `${jobsDir}/github-contrib`,
    cronPattern: '0 0 * * *' // every day at midnight
  },
  {
    name: 'delete',
    description: 'Deletes azimuth data older than 1 hour and geostorm data older than 1 month',
    modulePath: `${jobsDir}/delete`,
    cronPattern: '0 0 * * *' // every day at midnight
  }
]

export const getJobMetadata = (name: string): JobMetadata | undefined => {
  return jobRegistry.find(job => job.name === name)
}

export const getAvailableJobNames = (): string[] => {
  return jobRegistry.map(job => job.name)
}

/**
 * Converts a cron pattern to a human-readable string
 */
export const cronScheduleToHuman = (pattern: string): string => {
  const cronMap: Record<string, string> = {
    '* * * * * *': 'every second',
    '* * * * *': 'every minute',
    '0 * * * *': 'every hour',
    '0 0 * * *': 'every day at midnight',
    '0 */6 * * *': 'every 6 hours',
    '0 */12 * * *': 'every 12 hours',
    '0 0 * * 0': 'every week on Sunday',
    '0 0 1 * *': 'every month on the 1st'
  }
  return cronMap[pattern] ?? pattern
}
