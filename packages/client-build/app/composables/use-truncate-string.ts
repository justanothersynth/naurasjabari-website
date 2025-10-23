/**
 * Truncates a string to a specified length with an optional ending
 * @param text - The input string to truncate
 * @param len - The maximum length of the truncated string
 * @param end - The string to append when truncated
 * @param type - The type of truncation:
 *   - 'single': Truncates only the beginning
 *   - 'double': Truncates both beginning and end
 * @returns The truncated string
 * @example
 * ```ts
 * const short = useTruncateString('This is a very long string', 10) // 'This is a...'
 * const both = useTruncateString('This is a very long string', 10, '...', 'double') // 'This is...string'
 * ```
 */
export default (text: string, len: number = 30, end: string = '...', type: 'single' | 'double' = 'single'): string => {
  if (type === 'single') {
    return text.length > len + 3 ? `${text.slice(0, len)}${end}` : text
  } else {
    return text.length > len + 3 ? `${text.slice(0, len)}${end}${text.slice(-len)}` : text
  }
}
