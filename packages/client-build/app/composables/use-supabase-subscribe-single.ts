import type { SupabaseRealtimeSubscriptionEvent, SupabaseRealtimePayload } from '@workspace/types'

// Generic record type for items with timestamps
type SingleItem = Record<string, string | number | Date | null>

export interface SupabaseSubscribeSingleOptions<T> {
  topic: string
  events: SupabaseRealtimeSubscriptionEvent[]
  data: Ref<T | null>
  deleteRedirectPath?: string
}

/**
 * Composable for handling Supabase realtime subscriptions for single items
 * @param options - Configuration options for the subscription
 */
export const useSupabaseSubscribeSingle = <T = unknown>(options: SupabaseSubscribeSingleOptions<T>) => {
  const { $bus, $supabase } = useNuxtApp()
  const { topic, events, data, deleteRedirectPath = '/' } = options
  const realtimeTicker = ref(0) // Track the number of realtime changes

  /**
   * Handle UPDATE operations for single item
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleUpdate = (payload: SupabaseRealtimePayload) => {
    const incomingId = (payload.new as SingleItem)?.id
    const currentId = (data.value as SingleItem)?.id
    if (!data.value || incomingId !== currentId) return
    data.value = payload.new as T
  }

  /**
   * Handle DELETE operations for single item
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleDelete = (payload: SupabaseRealtimePayload) => {
    const deletedId = (payload.old as SingleItem)?.id
    const currentId = (data.value as SingleItem)?.id
    if (!data.value || deletedId !== currentId) return
    navigateTo(deleteRedirectPath)
  }

  /**
   * Main subscription handler
   * @param payload - The payload from the Supabase realtime subscription
   */
  const handleRealtimeChange = (payload: SupabaseRealtimePayload) => {
    realtimeTicker.value++
    switch (payload.eventType) {
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
