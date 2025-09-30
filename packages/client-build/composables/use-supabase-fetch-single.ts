type SupabaseResponse<T> = { data: T | null; error: unknown }

/**
 * Client-only composable for fetching a single item from Supabase
 * @param queryFn - Function that returns a Supabase query promise
 * @param options - Configuration options including table and itemId
 * @returns Object with data, error, loading state, and refresh function
 */
export const useSupabaseFetchSingle = <T = unknown>(
  queryFn: () => Promise<SupabaseResponse<T>>,
  _options: {
    table: string,
    itemId: string | number
  }
) => {
  // Use Supabase plugin instance
  const { $bus } = useNuxtApp()

  // Reactive state
  const data = ref<T | null>(null)
  const error = ref<unknown>(null)
  const loading = ref(false)
  const initialLoading = ref(true)

  // Data fetching function
  const fetchData = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await queryFn()

      if (!result.data) {
        showError({
          statusCode: 404,
          statusMessage: 'Item not found'
        })
        return
      }
      
      if (result.error) {
        throw result.error
      }

      data.value = result.data
      error.value = null
    } catch (err) {
      error.value = err
      data.value = null
    } finally {
      loading.value = false
      if (initialLoading.value) {
        initialLoading.value = false
      }
    }
  }

  // Refresh function
  const refresh = async () => {
    await fetchData()
  }

  const handleSupabaseClientRefreshed = () => {
    initialLoading.value = true
    refresh()
  }

  // Client-only initialization
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
    refresh
  }
}
