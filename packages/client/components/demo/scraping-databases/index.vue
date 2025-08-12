<template>
  <div class="max-w-4xl mx-auto">
    
    <div class="prose mb-12">
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

    <DemoScrapingDatabasesToolbar
      :filter="activityFilter"
      @search-change="updateSearchTerm"
      @filter-change="updateFilter" />

    <DemoScrapingDatabasesTable :data="data?.data || []" />

    <client-only>
      <DemoScrapingDatabasesPagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="totalItems"
        :has-previous="hasPrevious"
        :has-next="hasNext"
        @previous="goToPreviousPage"
        @next="goToNextPage" />
    </client-only>

  </div>
</template>

<script setup lang="ts">
import type { GeostormSupabase, SupabaseFilter } from '@workspace/types'

const {
  data,
  currentPage,
  pageSize,
  hasNext,
  hasPrevious,
  totalItems,
  goToNextPage,
  goToPreviousPage,
  filters,
  updateFilter,
  updateSearchTerm
} = useSupabaseFetchMulti<GeostormSupabase[]>({
  table: 'geostorm',
  select: '*',
  pageSize: 2,
  orderBy: 'created_at',
  orderDirection: 'desc',
  filters: [
    {
      id: 'activities',
      columnName: 'activities',
      mode: 'partial',
      defaultValue: 'all'
    }
  ]
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

const activityFilter = computed(() => filters.value.find(filter => filter.id === 'activities') as SupabaseFilter)
</script>
