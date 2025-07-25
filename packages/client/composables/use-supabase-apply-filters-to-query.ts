interface SupabaseQuery {
  eq: (column: string, value: string) => unknown
  in: (column: string, values: string[]) => unknown
}

/**
 * Helper function to apply filter mapping to a Supabase query
 * @param query - The Supabase query to apply filters to
 * @param filterValue - The current filter value (e.g., 'processing', 'pending')
 * @param filterMapping - Mapping of filter values to database status values
 * @param columnName - The database column to filter on (defaults to 'status')
 * @returns The query with filters applied
 */
export const useSupabaseApplyFiltersToQuery = <T extends SupabaseQuery>(
  query: T,
  filterValue: string,
  filterMapping: Record<string, string[]>,
  columnName: string = 'status'
): T => {
  // Don't apply any filter for 'all'
  if (!filterValue || filterValue === 'all') {
    return query
  }

  // Get the mapped status values
  const statusValues = filterMapping[filterValue]
  
  if (!statusValues || statusValues.length === 0) {
    // If no mapping found, fallback to direct filter match
    return query.eq(columnName, filterValue) as T
  }

  // Apply single or multiple status filter
  if (statusValues.length === 1) {
    return query.eq(columnName, statusValues[0]) as T
  } else {
    return query.in(columnName, statusValues) as T
  }
}
