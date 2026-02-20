/**
 * Converts a function to a string representation that is deterministic
 * @param func - The function to convert
 * @returns A deterministic string representation of the function
 */
export default (func: (...args: unknown[]) => void): string => {
  return func.toString()
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .replace(/\/\*.*?\*\//g, '')   // Remove block comments
    .replace(/\/\/.*$/gm, '')      // Remove line comments
    .replace(/^\s+|\s+$/g, '')     // Trim leading/trailing whitespace
}
