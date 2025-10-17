/**
 * Extracts the file extension from a filename.
 * @param filename - The filename to extract the extension from
 * @returns The file extension (without the dot)
 * @example
 * ```ts
 * const ext = useGetFileExt('document.pdf') // 'pdf'
 * const noExt = useGetFileExt('README') // ''
 * ```
 */
export default (filename: string): string => {
  return filename.split('.').pop() || ''
}
