import { filesize } from 'filesize'

/**
 * Formats a number of bytes into a human-readable string or object.
 * @param bytes - The number of bytes to format
 * @param format - The output format ('string' or 'object')
 * @returns Formatted bytes as string or object with value and unit
 * @example
 * ```ts
 * const formatted = useFormatBytes(1024) // "1 KB"
 * const { value, unit } = useFormatBytes(1024, 'object') // { value: "1", unit: "KB" }
 * ```
 */
export default (bytes: number, format: 'string' | 'object' = 'string'): string | { value: string | undefined, unit: string | undefined } => {
  const size = filesize(bytes, { round: 2 })
  if (format === 'string') { return size }
  const split = size.split(' ')
  return { value: split[0], unit: split[1] }
}
