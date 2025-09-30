/**
 * Capitalizes the first letter of each word in a name.
 * Preserves commas and spaces.
 * @param name - The name to capitalize.
 * @returns The capitalized name.
 */
export const useCapitalCase = (name: string) => {
  if (!name || typeof name !== 'string') return name
  
  // Check if name contains comma (format: "LAST, FIRST")
  if (name.includes(',')) {
    return name
      .split(',')
      .map(part => part.trim())
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(', ')
  }
  
  // Otherwise, treat as space-separated words (format: "FIRST LAST")
  return name
    .split(' ')
    .map(word => word.trim())
    .filter(word => word.length > 0) // Remove empty strings from multiple spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
