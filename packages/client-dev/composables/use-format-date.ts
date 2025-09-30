import { format, parseISO } from 'date-fns'

export const useFormatDate = (dateString: string, formatString: string = 'MM/dd/yyyy') => {
  if (!dateString) return 'N/A'
  try {
    const date = parseISO(dateString)
    return format(date, formatString)
  } catch {
    return dateString
  }
}
