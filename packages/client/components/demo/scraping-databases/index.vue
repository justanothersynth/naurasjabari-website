<template>
  <div class="max-w-4xl mx-auto">
    
    <div class="prose">
      <h2>Web scraping and database interfacing</h2>
      <p>
        While it's not as severe as other people I know, I do get migraines from time to time.
        I know most of my triggers, but was recently surprised to find a bit of a correlation with solar flares (a.k.a solar "storms" or "geostorms").
        The government of Canada has a
        <a class="hover:text-blue-700 transition-colors" href="https://www.spaceweather.gc.ca/forecast-prevision/short-court/zone-en.php" target="_blank">
          Solar storm forecast
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        that they update every 15 minutes. Time to whip out the web scraper!
        (The Github contributions graph at the top of this page was also scraped, but that's a story for another time 🤓)
      </p>
    </div>

    <DemoScrapingDatabasesTable :data="data?.data || []" />

  </div>
</template>

<script setup lang="ts">
import type { SupabasePaginationOptions, GeostormSupabase, SupabaseResponse } from '@workspace/types'

const { $supabase } = useNuxtApp()

const fetchData = async (opts: SupabasePaginationOptions) => {
  let query = $supabase
    .client
    .from(opts.table)
    .select('*')
    .order(opts.orderBy || 'created_at', {
      ascending: opts.orderDirection === 'asc'
    })
    .limit(opts.pageSize || 20)
    
  if (opts.cursor) {
    const operator = opts.orderDirection === 'asc' ? 'gt' : 'lt'
    query = query.filter(
      opts.orderBy || 'created_at',
      operator,
      opts.cursor
    )
  }
  return await query as SupabaseResponse<GeostormSupabase[]>
}

const { data } = useSupabaseFetchMulti<GeostormSupabase[]>(fetchData, {
  table: 'geostorm',
  pageSize: 20,
  orderBy: 'created_at',
  orderDirection: 'desc'
})

useSupabaseSubscribeMulti({
  topic: 'realtime-geostorm',
  events: [{
    event: '*',
    schema: 'public',
    table: 'geostorm'
  }],
  data,
  orderDirection: 'desc'
})
</script>
