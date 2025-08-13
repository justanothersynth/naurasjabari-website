<template>
  <section class="max-w-4xl mx-auto my-20">
    
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

  </section>
</template>

<script setup lang="ts">
import type { SunMoonSupabase } from '@workspace/types'

const { data } = useSupabaseFetchMulti<SunMoonSupabase[]>({
  table: 'sun_moon',
  select: '*',
  limit: 1,
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
