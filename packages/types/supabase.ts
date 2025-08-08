import type { Ref } from 'vue'

export interface SupabasePaginationOptions {
  table: string
  pageSize?: number
  cursor?: string | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filter?: string
  searchTerm?: string
}

export type SupabasePaginatedItem = Record<string, string | number | Date | null>

export interface SupabaseRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: SupabasePaginatedItem
  old?: SupabasePaginatedItem
  [key: string]: unknown
}

export interface SupabaseRealtimeSubscriptionEvent {
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema: string
  table: string
  filter?: string
}

export interface SupabaseSubscribeMultiOptions<T> {
  topic: string
  events: SupabaseRealtimeSubscriptionEvent[]
  data: Ref<{ data: T | null; error: unknown } | null>
  orderDirection: 'asc' | 'desc'
}

export interface SupabaseSubscribeSingleOptions<T> {
  topic: string
  subscriptionOptions: SupabaseRealtimeSubscriptionEvent
  data: Ref<T | null>
  itemId: string | number
}

export interface SupabaseResponse<T> {
  data: T | null
  error: unknown
}
