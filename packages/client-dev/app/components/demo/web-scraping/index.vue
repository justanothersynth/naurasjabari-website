<template>
  <section class="mt-30 relative z-10">
    
    <section class="container">
      <div class="prose mb-12 max-w-[50ch] small:max-w-[67ch]">
        <h2>Web scraping</h2>
        <p>
          As someone who gets migraines, I'm constantly attempting to find out what causes them. It's most often external factors for me and I've been anecdotally correlating them with solar flares — a.k.a "geostorms".
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
    </section>

    <DemoWebScrapingSkeleton v-if="shouldShowSkeleton" :count="3" />

    <div v-else-if="geostormEntries.length === 0" class="aspect-video flex items-center justify-center text-sm text-gray-500 font-medium border border-gray-200 rounded-3xl">
      No results found
    </div>

    <template v-else>

      <!-- Timeframe Headers -->
      <div
        :class="['grid grid-cols-3 medium:grid-cols-5 py-2 px-4 mb-4', offsetClasses, customContainerClasses]">
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
          :centered-slides="isLargeScreen"
          :navigation="{
            prevEl: prevButton,
            nextEl: nextButton
          }"
          :class="['geostorm-swiper overflow-visible!', offsetClasses]"
          @swiper="onSwiper">
          <SwiperSlide
            v-for="entry in geostormEntries"
            :key="entry.id"
            :class="customContainerClasses">
            <DemoWebScrapingSlide
              :entry="entry"
              :activity-colors="activityColors"
              :time-periods-visible="timePeriodsVisible"
              :timeframe-config="timeframeConfig" />
          </SwiperSlide>
        </Swiper>
      </client-only>
      
      <!-- Controls Row -->
      <div :class="['flex flex-col mini:flex-row justify-between items-center px-8', offsetClasses, customContainerClasses]">
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

const customContainerClasses = 'max-w-4xl! w-82! mini:w-138! medium:w-[91%]! medium:mx-auto'
const offsetClasses = 'mx-4! mini:mr-0! mini:ml-11! medium:ml-0!'

type TimePeriod = 'last24Hours' | 'last6Hours' | 'currentConditions' | 'next6Hours' | 'next24Hours'

const timeframeConfig: Record<TimePeriod, { short: string, long: string }> = {
  'last24Hours': { short: '← 24hr', long: 'Last 24 hours' },
  'last6Hours': { short: '← 6hr', long: 'Last 6 hours' },
  'currentConditions': { short: 'current', long: 'Current conditions' },
  'next6Hours': { short: '6hr →', long: 'Next 6 hours' },
  'next24Hours': { short: '24hr →', long: 'Next 24 hours' }
}

const isLargeScreen = useMediaQuery('(min-width: 64rem)')

const timePeriodsVisible = computed<ReadonlyArray<TimePeriod>>(() => {
  const allPeriods: TimePeriod[] = ['last24Hours', 'last6Hours', 'currentConditions', 'next6Hours', 'next24Hours']
  if (isLargeScreen.value) {
    return allPeriods
  }
  return allPeriods.filter(period => period !== 'last6Hours' && period !== 'next6Hours')
})

const timeframes = computed(() => {
  return timePeriodsVisible.value.map(period => timeframeConfig[period].short)
})

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

<style lang="scss" scoped>
.geostorm-swiper {
  overflow: visible !important;
}

:deep(.swiper-slide:not(.swiper-slide-active)) {
  opacity: 0.25;
  transition: opacity 300ms ease-in-out;
}
</style>
