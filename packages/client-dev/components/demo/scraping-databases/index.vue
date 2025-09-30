<template>
  <section class="max-w-4xl mx-auto">
    
    <div class="prose mb-12 max-w-[66ch]">
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

    <div class="my-4 aspect-video border-1 border-gray-200 rounded-3xl overflow-hidden">
      <DemoScrapingDatabasesSkeleton v-if="shouldShowSkeleton" :count="3" />
      <div v-else-if="geostormEntries.length === 0" class="h-full flex items-center justify-center text-sm text-gray-500 font-medium">
        No results found
      </div>
      <DemoScrapingDatabasesTable
        v-else
        :data="data?.data || []"
        :activity-colors="activityColors" />
    </div>

    <div class="flex justify-center items-center gap-2 mb-4">
      <span class="text-sm text-gray-600">Calmer</span>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="flex gap-1">
          <div
            v-for="color in activityColors"
            :key="color"
            :class="['w-3 h-3 rounded-full', color]" />
        </div>
      </div>
      <span class="text-sm text-gray-600">Stormier</span>
    </div>

    <client-only>
      <DemoScrapingDatabasesPagination
        :current-page="currentPage"
        :limit="limit"
        :total-items="totalItems"
        :has-previous="hasPrevious"
        :has-next="hasNext"
        @previous="goToPreviousPage"
        @next="goToNextPage" />
    </client-only>

  </section>
</template>

<script setup lang="ts">
import type { GeostormSupabase, SupabaseFilter } from '@workspace/types'

const activityColors = [
  'bg-purple-100',
  'bg-purple-200',
  'bg-purple-300',
  'bg-purple-400',
  'bg-purple-500',
  'bg-purple-600',
  'bg-purple-700',
  'bg-purple-800',
  'bg-purple-900'
]

// Track delayed refresh skeleton
const showDelayedRefreshSkeleton = ref(false)

const {
  data,
  error,
  currentPage,
  limit,
  hasNext,
  hasPrevious,
  totalItems,
  initialLoading,
  refreshLoading,
  goToNextPage,
  goToPreviousPage,
  filters,
  updateFilter,
  updateSearchTerm
} = useSupabaseFetchMulti<GeostormSupabase[]>({
  table: 'geostorm',
  select: '*',
  limit: 10,
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
  limit: 20,
  orderDirection: 'desc'
})

const activityFilter = computed(() => filters.value.find(filter => filter.id === 'activities') as SupabaseFilter)

// Toggle skeleton visibility
const shouldShowSkeleton = computed(() => {
  return initialLoading.value || showDelayedRefreshSkeleton.value
})

// Handle delayed skeleton for refresh loading
watch(refreshLoading, async (isRefreshLoading) => {
  if (isRefreshLoading) {
    showDelayedRefreshSkeleton.value = false
    await useDelay(500)
    // Only show skeleton if still refresh loading after delay
    if (refreshLoading.value) {
      showDelayedRefreshSkeleton.value = true
    }
  } else {
    showDelayedRefreshSkeleton.value = false
  }
})

const geostormEntries = computed(() => {
  if (error.value || data.value?.error) {
    return []
  }
  return [...(data.value?.data || [])]
})
</script>
