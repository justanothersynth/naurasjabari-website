<template>
  <div class="max-w-4xl mx-auto my-20">
    
    <div class="prose">
      <h2>Cron jobs, API integration and Supabase Realtime</h2>
      <p class="w-[67ch]">
        My dad was mildly obsessed with checking sunrise and sunset times wherever he was.
        It would be a near-daily "oh the sun comes up 1 minute earlier today" 🤦‍♂️.
        He passed away back in 2022 ♥️. This section is an ode to him, with some extra visualized information, just for fun.
        The locations below are a list of places I've either lived in or visited often.
      </p>
      <p>
        Huge thanks to the Norwegian Meteorologisk Intitutt for making a
        <a class="hover:text-blue-700 transition-colors" href="https://api.met.no/weatherapi/sunrise/3.0/documentation" target="_blank">
          Sun/Moon API Endpoint
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        freely available to use.
        I've got one cron job that queries that endpoint daily at midnight and another that populates a Supabase table every second.
        The per-second cron performs the azimuth (position in the sky) and day/night calculations.
        Of course, the azimuths could have just been calculated in a simple client-side timer, bypassing the database altogether, but that wouldn't be as interesting 🙃.
        And finally, I've got a Supabase Realtime connection set up, which is how you can see the azimuth values changing.
      </p>
    </div>

    <DemoCronApiSupabaseTable :data="data?.data || []" />

  </div>
</template>

<script setup lang="ts">
import type { SupabasePaginationOptions, SunMoonSupabase, SupabaseResponse } from '@workspace/types'

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
  return await query as SupabaseResponse<SunMoonSupabase[]>
}

const { data } = useSupabaseFetchMulti<SunMoonSupabase[]>(fetchData, {
  table: 'sun_moon',
  pageSize: 1,
  orderBy: 'created_at',
  orderDirection: 'desc'
})

useSupabaseSubscribeMulti({
  topic: 'realtime-sun_moon',
  events: [{
    event: '*',
    schema: 'public',
    table: 'sun_moon'
  }],
  data,
  orderDirection: 'desc'
})
</script>
