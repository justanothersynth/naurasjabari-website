<template>
  <div class="flex flex-col w-full mt-12 aspect-video text-sm border-1 border-gray-200 rounded-3xl overflow-hidden">

    <div class="grid grid-cols-5 border-b-1 border-gray-200 py-2 px-4">
      <div
        v-for="timeframe in timeframes"
        :key="timeframe"
        class="text-xs font-semibold text-center">
        {{ timeframe }}
      </div>
    </div>

    <div class="data-container relative flex-1 flex flex-col overflow-hidden">

      <!-- Top gradient -->
      <div
        class="gradient-top absolute top-0 left-0 right-0 h-16 w-full bg-gradient-to-b from-white to-transparent pointer-events-none z-10 transition-opacity duration-150"
        :class="{
          'opacity-100': canScrollUp,
          'opacity-0': !canScrollUp
        }" />

      <!-- Bottom gradient -->
      <div
        class="gradient-bottom absolute bottom-0 left-0 right-0 h-16 w-full bg-gradient-to-t from-white to-transparent pointer-events-none z-10 opacity-0 transition-opacity duration-150"
        :class="{
          'opacity-100': canScrollDown,
          'opacity-0': !canScrollDown
        }" />
      
      <!-- Data -->
      <div
        ref="scrollContainer"
        class="relative flex-1 p-2 overflow-y-scroll">
        
        <div
          v-for="entry in data"
          :key="entry.id"
          class="mt-8 first:mt-0">
          
          <!-- Timestamp Column -->
          <div class="whitespace-nowrap pr-4 mb-3 font-bold">
            {{ format(entry?.created_at || '', 'MMM d, h:mm a') }}
          </div>

          <!-- Data Columns -->
          <div class="flex flex-col gap-4 border-1 border-gray-200 rounded-2xl p-2">
            <div
              v-for="(regions, region) in reformatData(entry)"
              :key="region"
              class="flex flex-col gap-2">

              <div class="text-xs font-semibold">
                {{ region }}
              </div>

              <div class="flex">
                <div
                  v-for="(activities, timeframeIndex) in regions"
                  :key="`${region}-${timeframeIndex}`"
                  class="relative flex gap-1 hover:bg-gray-200 transition-colors duration-150 rounded-md p-[4px]"
                  @mouseenter="$tooltip.show(`${timeframeMap[activities.timeframe]}<br /> <span class='font-mono'>${activities.transition}</span>`)"
                  @mouseleave="$tooltip.hide">
                  <div
                    v-for="(activity, activityIndex) in activities.points"
                    :key="`${region}-${timeframeIndex}-${activityIndex}`"
                    class="flex justify-end gap-1">
                    <div
                      v-for="column in activity"
                      :key="`${region}-${timeframeIndex}-${activityIndex}-${column}`"
                      class="flex flex-col justify-end gap-1">
                      <span
                        v-for="point in column"
                        :key="`${region}-${timeframeIndex}-${activityIndex}-${column}-${point}`"
                        class="block w-2 h-2 rounded-full"
                        :class="activityColors[column] || 'bg-green-500'">
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useScroll } from '@vueuse/core'
import type { GeostormSupabase, GeostormOrpcInput } from '@workspace/types'

const _props = defineProps<{
  data: GeostormSupabase[]
}>()

// Scroll container ref for VueUse
const scrollContainer = ref<HTMLElement>()

// Use VueUse to track scroll position - using element as target
const { arrivedState } = useScroll(scrollContainer)

// Computed properties to determine when to show gradients
const canScrollUp = computed(() => !arrivedState.top)
const canScrollDown = computed(() => !arrivedState.bottom)

const timeframes = [
  '← 24hr',
  '← 6hr',
  'current',
  '→ 6hr',
  '→ 24hr'
]

const timeframeMap = {
  'last24Hours': 'Last 24 hours',
  'last6Hours': 'Last 6 hours',
  'currentConditions': 'Current conditions',
  'next6Hours': 'Next 6 hours',
  'next24Hours': 'Next 24 hours'
}

const heatMap = {
  quiet: 1,
  unsettled: 2,
  'active intervals': 3,
  active: 4,
  'stormy intervals': 5,
  stormy: 6,
  'major storm intervals': 7,
  'major storm': 8
}

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

/**
 * Generates an array with 7 entries that creates a curve-like transition from current to next value
 * @param current - The starting value
 * @param next - The target value
 * @returns Array of 7 numbers forming a curve pattern
 */
 function generatePointsArray(current: number, next: number): number[] {
  const result: number[] = new Array(7)
  
  // If values are the same, return array of identical values
  if (current === next) {
    return result.fill(current)
  }
  
  const difference = next - current
  const isIncreasing = difference > 0
  
  if (isIncreasing) {
    // For increasing: stay at current for most positions, then transition
    const transitionStart = 7 - Math.abs(difference)
    
    // Fill initial positions with current value
    for (let i = 0; i < transitionStart; i++) {
      result[i] = current
    }
    
    // Fill transition positions
    for (let i = transitionStart; i < 7; i++) {
      result[i] = current + (i - transitionStart + 1)
    }
  } else {
    // For decreasing: transition more quickly or stay at target
    const absDifference = Math.abs(difference)
    
    if (absDifference === 1) {
      // Small decrease: jump to next value after first position
      result[0] = current
      for (let i = 1; i < 7; i++) {
        result[i] = next
      }
    } else {
      // Larger decrease: linear transition then stay at target
      const transitionLength = Math.min(absDifference + 1, 6)
      
      // Linear transition
      for (let i = 0; i < transitionLength; i++) {
        result[i] = current - i
      }
      
      // Fill remaining positions with target value
      for (let i = transitionLength; i < 7; i++) {
        result[i] = next
      }
    }
  }
  
  return result
}

const reformatData = (data: GeostormSupabase) => {
  const regions = ['subAuroral', 'auroral', 'polar'] as const
  const timePeriods = ['last24Hours', 'last6Hours', 'currentConditions', 'next6Hours', 'next24Hours'] as const
  const reformattedData: Record<string, Array<{ timeframe: keyof typeof timeframeMap, points: number[][], transition: string }>> = {}

  for (const region of regions) {

    const activitiesList: string[] = []
    for (const timePeriod of timePeriods) {
      const activities = data[timePeriod as keyof GeostormOrpcInput][region]
      for (const activity of activities) {
        activitiesList.push(activity === '' ? activities[0] : activity)
      }
    }
  
    let currentTimeperiod: typeof timePeriods[number] = timePeriods[0]
    const lenI = activitiesList.length

    for (let i = 0; i < lenI; i++) {
      const current = activitiesList[i] as keyof typeof heatMap
      const currentCount = heatMap[current] || -1
      let next = activitiesList[i + 1] as keyof typeof heatMap
      let nextCount = heatMap[next] || -1

      if (!next) {
        next = current
        nextCount = currentCount
      }

      const currentTimeperiodArray = generatePointsArray(currentCount, nextCount)
      const transition = current === next ? current : `${current} → ${next}`
      
      if (!reformattedData[region]) {
        reformattedData[region] = []
      }
      
      // Find existing timeframe entry or create new one
      let timeframeEntry = reformattedData[region].find(entry => entry.timeframe === currentTimeperiod)
      if (!timeframeEntry) {
        timeframeEntry = { timeframe: currentTimeperiod, points: [], transition }
        reformattedData[region].push(timeframeEntry)
      }
      timeframeEntry.points.push(currentTimeperiodArray)

      if ((i + 1) % 2 === 0) {
        currentTimeperiod = timePeriods[timePeriods.indexOf(currentTimeperiod) + 1]
      }
    }

  }

  return reformattedData
}
</script>

<style lang="scss" scoped>
.location {
  position: relative;
  &:before,
  &:after {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid var(--color-gray-200);
    z-index: -1;
  }
  &:after {
    content: 'A';
    width: 200%;
    height: 200%;
    background-color: teal;
  }
  &:before {
    content: 'SA';
    width: 300%;
    height: 300%;
    background-color: tomato;
  }
}

.timeframe-legend {
  display: block;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    // background-color: var(--color-gray-500);
    z-index: -1;
  }
}
</style>
