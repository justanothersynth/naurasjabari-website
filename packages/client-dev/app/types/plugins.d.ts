import type { SupabaseClient } from '@supabase/supabase-js'
import type { Emitter } from 'mitt'
import type { SupabaseRealtimePayload, SupabaseRealtimeSubscriptionEvent } from '@workspace/types'

declare module '#app' {
  interface NuxtApp {
    $bus: {
      $on: Emitter<Record<string, unknown>>['on']
      $off: Emitter<Record<string, unknown>>['off']
      $emit: Emitter<Record<string, unknown>>['emit']
    }
    $supabase: {
      client: SupabaseClient
      subscribe: (
        topic: string,
        events: SupabaseRealtimeSubscriptionEvent[],
        handleRealtimeChange: (payload: SupabaseRealtimePayload) => void
      ) => void
    }
  }
}

export {}
