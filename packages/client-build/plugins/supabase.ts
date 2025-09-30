import { createClient  } from '@supabase/supabase-js'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseRealtimePayload, SupabaseRealtimeSubscriptionEvent } from '@workspace/types'

type HandleRealtimeChange = (payload: SupabaseRealtimePayload) => void

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const { $bus } = useNuxtApp()
  const channels = ref<Record<string, {
    channel: RealtimeChannel
    events: SupabaseRealtimeSubscriptionEvent[]
    handleRealtimeChange: HandleRealtimeChange
  }>>({})
  const route = useRoute()
  
  const generateClient = async (): Promise<SupabaseClient> => {
    return createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseKey as string,
      import.meta.server ? {} : {
        accessToken: async (): Promise<string | null> => {
          return null
        }
      }
    )
  }
  
  const client = ref<SupabaseClient>(await generateClient())

  const subscribe = (topic: string, events: SupabaseRealtimeSubscriptionEvent[], handleRealtimeChange: HandleRealtimeChange) => {
    if (import.meta.server || channels.value[topic]) return
    const channel = client.value.channel(topic)
    events.forEach(event => {
      // @ts-expect-error - Supabase types are not correct, this still works
      channel.on('postgres_changes', event, handleRealtimeChange)
    })
    channel.subscribe()
    channels.value[topic] = {
      channel,
      events,
      handleRealtimeChange
    }
  }

  const refreshClient = async () => {
    if (import.meta.server) return
    await client.value.removeAllChannels()
    client.value = await generateClient()
    channels.value = {}
    $bus.$emit('supabase:client-refreshed')
  }

  watch(route, refreshClient)

  return {
    provide: {
      supabase: {
        client: client.value,
        subscribe
      }
    }
  }
})
