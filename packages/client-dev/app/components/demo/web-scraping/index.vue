<template>
  <section class="max-w-4xl mx-auto mt-30 relative z-10">
    
    <div class="prose mb-12 max-w-[66ch]">
      <h2>Web scraping</h2>
      <p>
        As someone who gets migraines, I'm constantly attempting to find out what causes them. It's most often external factors for me.
        Recently I've been anecdotally correlating them with solar flares — a.k.a "geostorms".
        The Government of Canada has a
        <a class="inline-link" href="https://www.spaceweather.gc.ca/forecast-prevision/short-court/zone-en.php" target="_blank">
          solar storm forecast
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        that they update every 15 minutes. The website seems to be geofenced for non-clientside access, so I had to route my
        <a class="inline-link" href="https://github.com/timelytree/naurasjabari-website/tree/main/packages/crons/jobs/geostorm" target="_blank">
          scraper
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        (hosted in Germany) through
        <a class="inline-link" href="https://github.com/timelytree/naurasjabari-website/blob/main/packages/vercel/api/geostorm.js" target="_blank">
          a proxy server
          <Icon name="iconoir:arrow-up-right-square" size="16" class="ml-[2px]" />
        </a>
        (a Vercel Edge function) in the US.
      </p>
    </div>

    <DemoWebScrapingSkeleton v-if="shouldShowSkeleton" :count="3" />

    <div v-else-if="geostormEntries.length === 0" class="aspect-video flex items-center justify-center text-sm text-gray-500 font-medium border border-gray-200 rounded-3xl">
      No results found
    </div>

    <template v-else>

      <!-- Timeframe Headers -->
      <div class="grid grid-cols-5 py-2 px-4 mb-4 max-w-4xl mx-auto">
        <div
          v-for="timeframe in timeframes"
          :key="timeframe"
          class="text-xs font-semibold text-center text-gray-600">
          {{ timeframe }}
        </div>
      </div>

      <!-- Slider -->
      <client-only>
        <Swiper
          :modules="[Navigation]"
          :slides-per-view="'auto'"
          :space-between="16"
          :centered-slides="true"
          :navigation="{
            prevEl: prevButton,
            nextEl: nextButton
          }"
          class="geostorm-swiper overflow-visible!"
          @swiper="onSwiper">
          <SwiperSlide
            v-for="entry in geostormEntries"
            :key="entry.id"
            class="w-full! max-w-4xl">
            <DemoWebScrapingSlide
              :entry="entry"
              :activity-colors="activityColors" />
          </SwiperSlide>
        </Swiper>
      </client-only>
      
      <!-- Controls Row -->
      <div class="flex justify-between items-center px-8">
        <!-- Activity Colors -->
        <DemoWebScrapingActivityColors :activity-colors="activityColors" />
        <!-- Navigation Arrows -->
        <div class="flex items-center gap-4">
          <button ref="prevButton" :class="[navButtonClasses, 'pr-4']">
            <Icon name="iconoir:nav-arrow-left" size="16" class="mr-1" />
            Previous
          </button>
          <button ref="nextButton" :class="[navButtonClasses, 'pl-4']">
            Next
            <Icon name="iconoir:nav-arrow-right" size="16" class="ml-1" />
          </button>
        </div>
      </div>

    </template>

  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import type { Swiper as SwiperType } from 'swiper'
import type { GeostormSupabase } from '@workspace/types'

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

const timeframes = [
  '← 24hr',
  '← 6hr',
  'current',
  '6hr →',
  '24hr →'
]

const navButtonClasses = 'relative inline-flex items-center rounded-md p-2 text-sm font-semibold ring-1 ring-inset focus-visible:outline-offset-0 bg-white text-gray-900 ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-gray-200 disabled:cursor-not-allowed'

const swiperInstance = ref<SwiperType | null>(null)
const prevButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper
}

const showDelayedRefreshSkeleton = ref(false)

const {
  data,
  error,
  initialLoading,
  refreshLoading
} = useSupabaseFetchMulti<GeostormSupabase[]>({
  table: 'geostorm',
  select: '*',
  limit: 24,
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
  limit: 24,
  orderDirection: 'desc'
})

const shouldShowSkeleton = computed(() => {
  return initialLoading.value || showDelayedRefreshSkeleton.value
})

watch(refreshLoading, async (isRefreshLoading) => {
  if (isRefreshLoading) {
    showDelayedRefreshSkeleton.value = false
    await useDelay(500)
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

<style>
.geostorm-swiper {
  overflow: visible !important;
}
</style>
