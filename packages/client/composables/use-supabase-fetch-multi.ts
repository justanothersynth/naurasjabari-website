import type { SupabaseFilter, SupabasePaginationOptions, SupabaseResponse } from '@workspace/types'

// Generic record type for items with timestamps
type PaginatedItem = Record<string, string | number | Date | null>

/**
 * Client-only composable for fetching data from Supabase with realtime subscriptions and cursor-based pagination
 * @param dataQueryBuilderFn - Function that returns a base query builder with filtering logic applied
 * @param paginationOptions - Options for pagination
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
  const pageSize = ref(options.pageSize || 20)
  const currentCursor = ref<string | null>(options.cursor || null)
  const orderBy = ref(options.orderBy || 'createdAt')
  const orderDirection = ref<'asc' | 'desc'>(options.orderDirection || 'desc')
  const filters = ref<SupabaseFilter[]>(options.filters || [])
  const searchTerm = ref(options.searchTerm || '')
  
  // Keep track of cursors for previous pages
  const cursorHistory = ref<(string | null)[]>([null])
  const currentPage = ref(1)
  const hasPrevious = computed(() => currentPage.value > 1)

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

      // Build data query with pagination and ordering
      let dataQuery = $supabase.client
        .from(options.table)
        .select(options.select)
        .order(orderBy.value, { ascending: orderDirection.value === 'asc' })
        .limit(pageSize.value)

      // Apply cursor pagination
      if (currentCursor.value) {
        const operator = orderDirection.value === 'asc' ? 'gt' : 'lt'
        dataQuery = dataQuery.filter(orderBy.value, operator, currentCursor.value)
      }

      let countQuery = $supabase.client
        .from(options.table)
        .select(options.select, { count: 'exact', head: true })


      // Apply filter
      if (filters.value.length) {
        filters.value.forEach(filter => {
          dataQuery = useSupabaseApplyFiltersToQuery(dataQuery, filter)
          countQuery = useSupabaseApplyFiltersToQuery(countQuery, filter)
        })
      }

      if (searchTerm.value !== '') {
        dataQuery = dataQuery.ilike('activities', `%${searchTerm.value}%`)
        countQuery = countQuery.ilike('activities', `%${searchTerm.value}%`)
      }
      
      // Execute both queries in parallel
      const [result, countResult] = await Promise.all([
        dataQuery.then(),
        countQuery.then()
      ])

      data.value = result as unknown as SupabaseResponse<T>
      error.value = result.error
      totalItems.value = countResult.count || 0
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
    filters,
    updateFilter,
    // Search
    searchTerm,
    updateSearchTerm
  }
}
