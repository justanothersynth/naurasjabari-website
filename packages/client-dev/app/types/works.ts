/**
 * Represents a tag that can be either a simple string or an object with additional properties
 */
export type WorkTag = string | {
  label: string
  url?: string
  extraClasses?: string
  attribution?: string
}

/**
 * Represents the status of a work project
 */
export type WorkStatus = 'live' | 'archived' | 'offline'

/**
 * Represents a work/project entry
 */
export type WorkEntry = {
  id: string
  title: string
  description: string
  image: string
  link?: string
  status: WorkStatus
  tags?: WorkTag[]
  attribution?: string
}
