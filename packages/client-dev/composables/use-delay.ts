/**
 * Creates a promise that resolves after the specified number of milliseconds.
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 * @example
 * ```ts
 * // Wait for 1 second
 * await useDelay(1000)
 * ```
 */
export default (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
