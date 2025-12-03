import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

type FormatTimeOptions = {
  /**
   * IANA timezone identifier (e.g., 'America/Toronto', 'Europe/London').
   * When provided, properly handles DST transitions.
   * Takes precedence over includeTimezoneOffset.
   */
  timezone?: string
  /**
   * Extracts offset from ISO string (doesn't handle DST).
   * Note: best to use `timezone` instead for proper DST handling.
   */
  includeTimezoneOffset?: boolean
  use24Hour?: boolean
  showAmPm?: boolean
}

/**
 * Formats a time string using date-fns with configurable 24-hour or 12-hour format
 * @param timeString - ISO date string or time string to format
 * @param options - Configuration options for formatting
 * @returns Formatted time string or original string if parsing fails
 */
export const useFormatTime = (
  timeString: string | undefined | null,
  options: FormatTimeOptions = {}
): string => {
  if (!timeString) return ''

  const {
    timezone,
    includeTimezoneOffset = false,
    use24Hour = true,
    showAmPm = true
  } = options

  try {
    const date = parseISO(timeString)

    // Determine the format pattern based on options
    let formatPattern: string
    if (use24Hour) {
      formatPattern = 'HH:mm'
    } else {
      formatPattern = showAmPm ? 'h:mm a' : 'h:mm'
    }

    // If IANA timezone is provided, use it (handles DST automatically)
    if (timezone) {
      return formatInTimeZone(date, timezone, formatPattern)
    }

    // Extract the numeric offset from the string (e.g., -08:00)
    if (includeTimezoneOffset) {
      const offsetMatch = timeString.match(/([+-]\d{2}):?(\d{2})/)
      if (!offsetMatch) return formatInTimeZone(date, 'UTC', formatPattern) // fallback to UTC

      const [_, hours, minutes] = offsetMatch
      if (!hours || !minutes) return timeString
      const offsetMinutes = Number.parseInt(hours) * 60 + Number.parseInt(minutes)
      const fakeOffsetZone = `Etc/GMT${offsetMinutes > 0 ? '-' : '+'}${Math.abs(offsetMinutes / 60)}`
      return formatInTimeZone(date, fakeOffsetZone, formatPattern)
    }

    return format(date, formatPattern)
  } catch {
    return timeString
  }
}
