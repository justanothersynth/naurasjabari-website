import type { SupabaseFilter, SupabasePaginationOptions, SupabaseResponse } from '@workspace/types'

// Generic record type for items with timestamps
type PaginatedItem = Record<string, string | number | Date | null>

/**
 * Client-only composable for fetching data from Supabase with realtime subscriptions and cursor-based pagination
 * @param options - Options for the fetch multi composable
 * @returns Object with data, error, loading state, refresh function, and pagination methods
 */
export const useSupabaseFetchMulti = <T = unknown>(
  options: SupabasePaginationOptions
) => {
  const { $bus, $supabase } = useNuxtApp()

  // Reactive state
  const data = ref<SupabaseResponse<T> | null>(null)
  const error = ref<unknown>(null)
  const loading = ref(false)
  const initialLoading = ref(true)
  const refreshLoading = ref(false)
  const totalItems = ref<number>(0)

  // Pagination state
  const limit = ref(options.limit || 20)
  const currentCursor = ref<string | null>(options.cursor || null)
  const orderBy = ref(options.orderBy || 'createdAt')
  const orderDirection = ref<'asc' | 'desc'>(options.orderDirection || 'desc')
  const filters = ref<SupabaseFilter[]>(options.filters || [])
  const searchTerm = ref(options.searchTerm || '')
  
  // Keep track of page boundaries for navigation
  const pageHistory = ref<{ startCursor: string | null, endCursor: string | null }[]>([{ startCursor: null, endCursor: null }])
  const currentPage = ref(1)
  const hasPrevious = computed(() => currentPage.value > 1)

  // Query variables that will be built by initQueries()
  let dataQuery: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
  let countQuery: any = null // eslint-disable-line @typescript-eslint/no-explicit-any

  // Set default filter values
  if (filters.value.length) {
    filters.value.forEach(filter => {
      filter.filterValue = filter.defaultValue
    })
  }

  // Compute hasNext based on returned data
  const hasNext = computed(() => {
    if (!data.value?.data || !Array.isArray(data.value.data)) {
      return false
    }
    return data.value.data.length >= limit.value
  })

  /**
   * Initializes the data and count queries based on current state
   */
  const initQueries = () => {
    // Set up queries
    dataQuery = $supabase.client
      .from(options.table)
      .select(options.select)
      .order(orderBy.value, { ascending: orderDirection.value === 'asc' })
      .limit(limit.value)

    countQuery = $supabase.client
      .from(options.table)
      .select(options.select, { count: 'exact', head: true })

    // Apply cursor pagination
    if (currentCursor.value) {
      const operator = orderDirection.value === 'asc' ? 'gt' : 'lt'
      dataQuery = dataQuery.filter(orderBy.value, operator, currentCursor.value)
    }

    // Apply filters
    if (filters.value.length) {
      filters.value.forEach(filter => {
        dataQuery = useSupabaseApplyFiltersToQuery(dataQuery, filter)
        countQuery = useSupabaseApplyFiltersToQuery(countQuery, filter)
      })
    }

    // Apply search term
    if (searchTerm.value !== '') {
      dataQuery = dataQuery.ilike('activities', `%${searchTerm.value}%`)
      countQuery = countQuery.ilike('activities', `%${searchTerm.value}%`)
    }
  }

  // Count fetching function
  const fetchCount = async () => {
    try {
      const countResult = await countQuery
      totalItems.value = countResult.count || 0
    } catch {
      // Silently handle count fetch errors to avoid disrupting the UI
      totalItems.value = 0
    }
  }

  /**
   * Executes the count and data queries and handles the results
   */
  const fetchData = async () => {
    try {
      loading.value = true
      if (!initialLoading.value) {
        // This is a subsequent load (refresh, filter, search, pagination)
        refreshLoading.value = true
      }
      error.value = null
      
      // Execute both queries in parallel
      const [result] = await Promise.all([
        dataQuery.then(),
        fetchCount()
      ])

      data.value = result as unknown as SupabaseResponse<T>
      error.value = result.error
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
  const refresh = async () => {
    initQueries()
    await fetchData()
  }

  // Update filter and refetch
  const updateFilter = async (payload: { filterId: string, filterValue: string }) => {
    const { filterId, filterValue } = payload
    if (!filters.value.length) return
    const filter = filters.value.find(filter => filter.id === filterId)
    if (!filter) return
    filter.filterValue = filterValue
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
      // Store current page end cursor in history
      const currentPageIndex = currentPage.value - 1
      const currentPageEntry = pageHistory.value[currentPageIndex]
      if (currentPageEntry) {
        currentPageEntry.endCursor = lastItem[orderBy.value] as string
      }
      
      // Set new cursor and add new page to history
      currentCursor.value = lastItem[orderBy.value] as string
      currentPage.value++
      
      // Add new page entry to history
      pageHistory.value.push({ startCursor: currentCursor.value, endCursor: null })
      
      // Refresh data with new cursor
      initQueries()
      await fetchData()
    }
  }

  const goToPreviousPage = async () => {
    if (!hasPrevious.value) return

    // Remove current page from history
    pageHistory.value.pop()
    currentPage.value--
    
    // Get the previous page's start cursor
    const previousPageIndex = currentPage.value - 1
    const previousPage = pageHistory.value[previousPageIndex]

    if (!previousPage) return
    
    currentCursor.value = previousPage.startCursor
    
    // Refresh data with previous cursor
    initQueries()
    await fetchData()
  }

  const goToFirstPage = async () => {
    if (currentPage.value === 1) return
    await resetPagination()
  }

  const resetPagination = async () => {
    currentCursor.value = null
    pageHistory.value = [{ startCursor: null, endCursor: null }]
    currentPage.value = 1
    initQueries()
    await fetchData()
  }

  const realtimeTicker = ref(0)
  
  const handleSupabaseClientRefreshed = () => {
    initialLoading.value = true
    initQueries()
    refresh()
  }

  const handleRealtimeChange = () => {
    fetchCount()
  }

  onMounted(() => {
    initQueries()
    fetchData()
    $bus.$on('supabase:client-refreshed', handleSupabaseClientRefreshed)
    $bus.$on('supabase:realtime-change', handleRealtimeChange)
  })

  onUnmounted(() => {
    $bus.$off('supabase:client-refreshed', handleSupabaseClientRefreshed)
    $bus.$off('supabase:realtime-change', handleRealtimeChange)
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
    limit: readonly(limit),
    hasNext: readonly(hasNext),
    hasPrevious,
    // Pagination methods
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    resetPagination,
    // Filter
    filters,
    updateFilter,
    // Search
    searchTerm,
    updateSearchTerm
  }
}
