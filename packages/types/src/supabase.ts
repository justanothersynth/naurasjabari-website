import type { Ref } from 'vue'

export interface SupabaseFilter {
  id: string
  columnName: string
  mode: 'partial' | 'exact'
  defaultValue: string
  filterMapping?: Record<string, string[]>
  filterValue?: string | null
}

export interface SupabasePaginationOptions {
  select: string
  table: string
  limit?: number
  cursor?: string | null
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: SupabaseFilter[]
  searchTerm?: string
  filterMaps?: {
    column: string
    map: Record<string, string[]>
  }[]
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
  limit?: number
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
