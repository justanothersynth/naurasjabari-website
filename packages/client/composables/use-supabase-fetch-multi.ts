// import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SupabasePaginationOptions, SupabaseResponse } from '@workspace/types'

// Generic record type for items with timestamps
type PaginatedItem = Record<string, string | number | Date | null>

/**
 * Client-only composable for fetching data from Supabase with realtime subscriptions and cursor-based pagination
 * @param table - The Supabase table to query
 * @param queryFn - Function that returns a Supabase query promise, receives pagination options
 * @param paginationOptions - Options for pagination
 * @param filterMapping - Optional mapping of filter values to status values for total count query
 * @returns Object with data, error, loading state, refresh function, and pagination methods
 */
export const useSupabaseFetchMulti = <T = unknown>(
  queryFn: (options: SupabasePaginationOptions) => Promise<SupabaseResponse<T>>,
  options: SupabasePaginationOptions,
  filterMapping?: Record<string, string[]>
) => {
  const { $supabase, $bus } = useNuxtApp()

  // Reactive state
  const data = ref<SupabaseResponse<T> | null>(null)
  const error = ref<unknown>(null)
  const loading = ref(false)
  const initialLoading = ref(true)
  const refreshLoading = ref(false)
  const totalItems = ref<number>(0)

  // Pagination state
  const pageSize = ref(options.pageSize || 20)
  const currentCursor = ref<string | null>(options.cursor || null)
  const orderBy = ref(options.orderBy || 'createdAt')
  const orderDirection = ref<'asc' | 'desc'>(options.orderDirection || 'desc')
  const filter = ref(options.filter || 'all')
  const searchTerm = ref(options.searchTerm || '')
  
  // Keep track of cursors for previous pages
  const cursorHistory = ref<(string | null)[]>([null])
  const currentPage = ref(1)
  const hasPrevious = computed(() => currentPage.value > 1)

  // Compute hasNext based on returned data
  const hasNext = computed(() => {
    if (!data.value?.data || !Array.isArray(data.value.data)) {
      return false
    }
    return data.value.data.length >= pageSize.value
  })

  // Data fetching function
  const fetchData = async () => {
    try {
      loading.value = true
      if (!initialLoading.value) {
        // This is a subsequent load (refresh, filter, search, pagination)
        refreshLoading.value = true
      }
      error.value = null

      // Fetch main data
      const result = await queryFn({
        pageSize: pageSize.value,
        cursor: currentCursor.value,
        orderBy: orderBy.value,
        orderDirection: orderDirection.value,
        filter: filter.value,
        searchTerm: searchTerm.value,
        table: options.table
      })

      // Fetch total count
      let countQuery = $supabase.client.from(options.table).select('*', { count: 'estimated', head: true })
      if (filterMapping) {
        countQuery = useSupabaseApplyFiltersToQuery(countQuery, filter.value, filterMapping)
      } else if (filter.value && filter.value !== 'all') {
        // Fallback to simple filter if no mapping provided
        countQuery = countQuery.eq('status', filter.value)
      }
      const { count } = await countQuery

      data.value = result
      error.value = result.error
      totalItems.value = count || 0
    } catch (err) {
      error.value = err
      data.value = null
      totalItems.value = 0
    } finally {
      loading.value = false
      if (initialLoading.value) {
        initialLoading.value = false
      } else {
        refreshLoading.value = false
      }
    }
  }

  // Refresh function
  const refresh = async () => await fetchData()

  // Update filter and refetch
  const updateFilter = async (newFilter: string) => {
    filter.value = newFilter
    await resetPagination()
  }

  // Update search term and refetch
  const updateSearchTerm = async (newSearchTerm: string) => {
    searchTerm.value = newSearchTerm
    await resetPagination()
  }

  // Pagination methods
  const goToNextPage = async () => {
    if (!hasNext.value || !data.value?.data || !Array.isArray(data.value.data)) return

    const lastItem = data.value.data[data.value.data.length - 1] as PaginatedItem
    if (lastItem && lastItem[orderBy.value]) {
      // Store current cursor in history
      cursorHistory.value.push(currentCursor.value)
      
      // Set new cursor
      currentCursor.value = lastItem[orderBy.value] as string
      currentPage.value++
      
      // Refresh data with new cursor
      await fetchData()
    }
  }

  const goToPreviousPage = async () => {
    if (!hasPrevious.value) return

    // Get previous cursor from history
    cursorHistory.value.pop() // Remove current cursor
    const previousCursor = cursorHistory.value[cursorHistory.value.length - 1]
    
    currentCursor.value = previousCursor
    currentPage.value--
    
    // Refresh data with previous cursor
    await fetchData()
  }

  const resetPagination = async () => {
    currentCursor.value = null
    cursorHistory.value = [null]
    currentPage.value = 1
    await fetchData()
  }

  const realtimeTicker = ref(0)
  
  const handleSupabaseClientRefreshed = () => {
    initialLoading.value = true
    refresh()
  }

  onMounted(() => {
    fetchData()
    $bus.$on('supabase:client-refreshed', handleSupabaseClientRefreshed)
  })

  onUnmounted(() => {
    $bus.$off('supabase:client-refreshed', handleSupabaseClientRefreshed)
  })

  return {
    data,
    error: readonly(error),
    loading: readonly(loading),
    initialLoading: readonly(initialLoading),
    refreshLoading: readonly(refreshLoading),
    totalItems: readonly(totalItems),
    refresh,
    realtimeTicker,
    // Pagination state
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSize),
    hasNext: readonly(hasNext),
    hasPrevious,
    // Pagination methods
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    // Filter
    filter,
    updateFilter,
    // Search
    searchTerm,
    updateSearchTerm
  }
}
