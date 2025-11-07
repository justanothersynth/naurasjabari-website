import type { SupabaseFilter } from '@workspace/types'

interface SupabaseQuery {
  eq: (column: string, value: string) => unknown
  in: (column: string, values: string[]) => unknown
  ilike: (column: string, pattern: string) => unknown
}

/**
 * Helper function to apply filter mapping to a Supabase query
 * @param query - The query to apply filters to
 * @param options - Configuration options for applying filters
 * @returns The query with filters applied
 */
export const useSupabaseApplyFiltersToQuery = <T extends SupabaseQuery>(
  query: T,
  options: SupabaseFilter
): T => {
  const { filterValue, filterMapping, columnName, mode, defaultValue } = options
  
  // Don't apply any filter for 'all'
  if (!filterValue || filterValue === defaultValue) {
    return query
  }

  // Handle partial mode with ilike
  if (mode === 'partial') {
    return query.ilike(columnName, `%${filterValue}%`) as T
  }

  // Handle exact mode with mapping (existing logic)
  if (!filterMapping) {
    // If no mapping provided, fallback to direct filter match
    return query.eq(columnName, filterValue) as T
  }

  // Get the mapped values
  const values = filterMapping[filterValue]
  
  if (!values || values.length === 0) {
    // If no mapping found, fallback to direct filter match
    return query.eq(columnName, filterValue) as T
  }

  // Apply single or multiple filter
  if (values.length === 1) {
    return query.eq(columnName, values[0]!) as T
  } else {
    return query.in(columnName, values) as T
  }
}
