<template>
  <section class="container my-20 relative z-10">
    
    <div class="prose max-w-[50ch] small:max-w-[67ch]">
      <h2>Cron jobs, API integration and Supabase Realtime</h2>
      <p>
        My dad was mildly obsessed with checking sunrise and sunset times wherever he was.
        It would be a near-daily "oh the sun comes up 1 minute earlier today" 🤦‍♂️.
        He passed away back in 2022 ♥️. This section is an ode to him.
        The locations below are places I've either lived in or visited often.
      </p>
      <p>
        Huge thanks to the Norwegian Meteorologisk Intitutt for making a
        <a class="inline-link" href="https://api.met.no/weatherapi/sunrise/3.0/documentation" target="_blank">
          Sun/Moon API Endpoint
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        freely available to use.
        I have one
        <a class="inline-link" href="https://github.com/timelytree/naurasjabari-website/tree/main/packages/crons/jobs/sun-moon" target="_blank">
          cron job
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        that queries the endpoint daily at midnight, getting the sunrise and sunset times and moon phases. And another
        <a class="inline-link" href="https://github.com/timelytree/naurasjabari-website/tree/main/packages/crons/jobs/azimuth" target="_blank">
          cron job
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        that updates a Supabase table every second with the azimuth (sky position) and day/night calculations.
        Technically, the azimuths could be calculated with a simple client-side timer, skipping the database entirely — but that wouldn’t be as interesting. Overengineering at it's finest over here 🍸.
        Finally, I set up a Supabase Realtime connection, which is how you can see the azimuth values updating live.
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
  limit: 1,
  orderDirection: 'desc'
})
</script>
