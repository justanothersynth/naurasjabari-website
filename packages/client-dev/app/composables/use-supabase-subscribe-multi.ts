import type { SupabaseSubscribeMultiOptions, SupabaseRealtimePayload, SupabasePaginatedItem } from '@workspace/types'

/**
 * Composable for handling Supabase realtime subscriptions
 * @param options - Configuration options for the subscription
 */
export const useSupabaseSubscribeMulti = <T = unknown>(options: SupabaseSubscribeMultiOptions<T>) => {
  const { $bus, $supabase } = useNuxtApp()
  const { topic, events, data, orderDirection, limit } = options

  /**
   * Handle INSERT operations
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleInsert = (payload: SupabaseRealtimePayload) => {
    if (!data.value?.data || !Array.isArray(data.value.data) || !payload.new) return

    const currentData = [...data.value.data] as SupabasePaginatedItem[]
    const pageLimit = limit || 20 // Default to 20 if no limit provided
    
    // Add new item at the beginning if desc order, at the end if asc order
    if (orderDirection === 'desc') {
      currentData.unshift(payload.new as SupabasePaginatedItem)
      // Only remove the last item if we exceed the page limit
      if (currentData.length > pageLimit) {
        currentData.pop()
      }
    } else {
      currentData.push(payload.new as SupabasePaginatedItem)
      // Only remove the first item if we exceed the page limit
      if (currentData.length > pageLimit) {
        currentData.shift()
      }
    }

    // Update the data with modified array and trigger reactivity
    data.value = {
      ...data.value,
      data: currentData as T
    }
  }

  /**
   * Handle UPDATE operations
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleUpdate = (payload: SupabaseRealtimePayload) => {
    if (!data.value?.data || !Array.isArray(data.value.data) || !payload.new || !payload.old) return

    const currentData = [...data.value.data] as SupabasePaginatedItem[]
    
    // Find and update the existing item
    const index = currentData.findIndex(item =>
      item.id === (payload.old as SupabasePaginatedItem).id
    )
    
    if (index !== -1) {
      currentData[index] = payload.new as SupabasePaginatedItem
      
      // Update the data with modified array
      data.value = {
        ...data.value,
        data: currentData as T
      }
    }
  }

  /**
   * Handle DELETE operations
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleDelete = (payload: SupabaseRealtimePayload) => {
    if (!data.value?.data || !Array.isArray(data.value.data) || !payload.old) return

    const currentData = [...data.value.data] as SupabasePaginatedItem[]
    
    // Find and remove the deleted item
    const index = currentData.findIndex(item =>
      item.id === (payload.old as SupabasePaginatedItem).id
    )
    
    if (index !== -1) {
      currentData.splice(index, 1)
      
      // Update the data with modified array
      data.value = {
        ...data.value,
        data: currentData as T
      }
    }
  }

  /**
   * Main subscription handler
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleRealtimeChange = (payload: SupabaseRealtimePayload) => {
    switch (payload.eventType) {
      case 'INSERT': handleInsert(payload); break
      case 'UPDATE': handleUpdate(payload); break
      case 'DELETE': handleDelete(payload); break
    }
    $bus.$emit('supabase:realtime-change', payload)
  }

  const subscribe = () => {
    $supabase.subscribe(topic, events, handleRealtimeChange)
  }

  $bus.$on('supabase:client-refreshed', subscribe)

  onMounted(() => {
    subscribe()
  })

  onBeforeUnmount(() => {
    $bus.$off('supabase:client-refreshed', subscribe)
  })
}
