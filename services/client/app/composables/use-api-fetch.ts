import { ref, type Ref } from 'vue'

/**
 * Options for the useApiFetch composable
 */
type UseApiFetchOptions = {
  /**
   * Whether to automatically execute the fetch on composable initialization (defaults to false)
   */
  immediate?: boolean
}

/**
 * Return type for the useApiFetch composable
 */
type UseApiFetchReturn<T> = {
  /**
   * The reactive data from the API response
   */
  data: Ref<T | null>
  
  /**
   * Error object if the request fails
   */
  error: Ref<Error | null>
  
  /**
   * Loading state indicator
   */
  isLoading: Ref<boolean>
  
  /**
   * Execute/re-execute the fetch request
   */
  execute: () => Promise<void>
}

/**
 * Composable for fetching data from the API with environment-aware routing.
 *
 * In development mode, requests are proxied through the Nuxt server route
 * to handle HTTP/HTTPS mismatches. In production, requests go directly to
 * the API for optimal performance.
 *
 * @param path - API path (e.g., '/data/github-contrib-total.json')
 * @param options - Configuration options
 * @returns Object containing reactive data, error, isLoading refs and execute function
 *
 * @example
 * ```ts
 * const { data, error, isLoading, execute } = useApiFetch<MyType>('/data/my-endpoint.json', {
 *   immediate: true
 * })
 * ```
 */
export function useApiFetch<T = unknown>(
  path: string,
  options: UseApiFetchOptions = {}
): UseApiFetchReturn<T> {
  const { immediate = false } = options
  
  const config = useRuntimeConfig()
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  
  /**
   * Determines the correct URL based on the current environment
   */
  const getUrl = (): string => {
    const serverEnv = config.public.serverEnv
    
    // In production, call API directly for better performance
    if (serverEnv === 'production') {
      return `${config.public.apiUrl}${path}`
    }
    
    // In development, use the proxy route to handle HTTPS/HTTP mismatches
    return `/api${path}`
  }
  
  /**
   * Executes the API fetch request
   */
  const execute = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const url = getUrl()
      const response = await $fetch<T>(url)
      data.value = response
    } catch (err) {
      // Convert the error to an Error object for consistent handling
      if (err instanceof Error) {
        error.value = err
      } else {
        error.value = new Error(String(err))
      }
      
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error(`[useApiFetch] Failed to fetch ${path}:`, err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Auto-execute if immediate option is true
  if (immediate) {
    execute()
  }
  
  return {
    data,
    error,
    isLoading,
    execute
  }
}
