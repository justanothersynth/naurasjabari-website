<template>
  <div class="flex flex-col w-full h-full text-sm p-4 border border-gray-200 rounded-3xl bg-white">

    <!-- Timestamp -->
    <div class="whitespace-nowrap mb-4 font-bold text-md absolute top-4 left-5">
      {{ format(entry?.created_at || '', 'MMM d, h:mm a') }}
    </div>

    <!-- Data Columns -->
    <div class="flex flex-col gap-4">
      <div
        v-for="(regions, region) in reformattedData"
        :key="region"
        class="flex flex-col gap-2">

        <div class="text-xs font-semibold text-gray-700 text-right pr-2">
          {{ region }}
        </div>

        <div class="flex">
          <div
            v-for="(activities, timeframeIndex) in regions"
            :key="`${region}-${timeframeIndex}`"
            class="relative flex gap-1 hover:bg-gray-100 transition-colors duration-150 rounded-md p-[4px]"
            @mouseenter="$tooltip.show(`${timeframeMap[activities.timeframe]}<br /> <span class='font-mono'>${activities.transition}</span>`)"
            @mouseleave="$tooltip.hide">
            <div
              v-for="(activity, activityIndex) in activities.points"
              :key="`${region}-${timeframeIndex}-${activityIndex}`"
              class="flex justify-end gap-1">
              <div
                v-for="(column, columnIndex) in activity"
                :key="`${region}-${timeframeIndex}-${activityIndex}-${columnIndex}`"
                class="flex flex-col justify-end gap-1">
                <span
                  v-for="point in 8"
                  :key="`${region}-${timeframeIndex}-${activityIndex}-${columnIndex}-${point}`"
                  class="block w-2 h-2 rounded-full"
                  :class="[
                    activityColors[column] || 'bg-green-500',
                    (9 - point) > column ? 'invisible' : ''
                  ]" />
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
import type { GeostormSupabase, GeostormOrpcInput, GeostormOrpcInputRegions } from '@workspace/types'

const props = defineProps<{
  entry: GeostormSupabase
  activityColors: string[]
}>()

const { $tooltip } = useNuxtApp()

const timeframeMap: Record<string, string> = {
  'last24Hours': 'Last 24 hours',
  'last6Hours': 'Last 6 hours',
  'currentConditions': 'Current conditions',
  'next6Hours': 'Next 6 hours',
  'next24Hours': 'Next 24 hours'
}

const heatMap: Record<string, number> = {
  quiet: 1,
  'unsettled intervals': 2,
  unsettled: 3,
  'active intervals': 4,
  active: 5,
  'stormy intervals': 5,
  stormy: 6,
  'major storm intervals': 7,
  'major storm': 8
}

/**
 * Generates an array with 7 entries that creates a curve-like transition from current to next value
 * @param current - The starting value
 * @param next - The target value
 * @returns Array of 7 numbers forming a curve pattern
 */
const generatePointsArray = (current: number, next: number): number[] => {
  const result: number[] = Array.from({ length: 7 })
  
  if (current === next) {
    return result.fill(current)
  }
  
  const difference = next - current
  const isIncreasing = difference > 0
  
  if (isIncreasing) {
    const transitionStart = 7 - Math.abs(difference)
    
    for (let i = 0; i < transitionStart; i++) {
      result[i] = current
    }
    
    for (let i = transitionStart; i < 7; i++) {
      result[i] = current + (i - transitionStart + 1)
    }
  } else {
    const absDifference = Math.abs(difference)
    
    if (absDifference === 1) {
      result[0] = current
      for (let i = 1; i < 7; i++) {
        result[i] = next
      }
    } else {
      const transitionLength = Math.min(absDifference + 1, 6)
      
      for (let i = 0; i < transitionLength; i++) {
        result[i] = current - i
      }
      
      for (let i = transitionLength; i < 7; i++) {
        result[i] = next
      }
    }
  }
  
  return result
}

const reformattedData = computed(() => {
  const data = props.entry
  const regions = ['subAuroral', 'auroral', 'polar'] as const
  const timePeriods = ['last24Hours', 'last6Hours', 'currentConditions', 'next6Hours', 'next24Hours'] as const
  const result: Record<string, Array<{ timeframe: string, points: number[][], transition: string }>> = {}

  for (const region of regions) {
    const activitiesList: string[] = []
    for (const timePeriod of timePeriods) {
      const activities = (data[timePeriod as keyof GeostormOrpcInput] as GeostormOrpcInputRegions)[region]
      for (const activity of activities) {
        activitiesList.push(activity === '' ? (activities[0] ?? '') : activity)
      }
    }
  
    let currentTimeperiod: typeof timePeriods[number] = timePeriods[0]
    const lenI = activitiesList.length

    for (let i = 0; i < lenI; i++) {
      const current = activitiesList[i] ?? ''
      const currentCount = heatMap[current] || -1
      const next = activitiesList[i + 1] ?? current
      const nextCount = heatMap[next] || -1

      const currentTimeperiodArray = generatePointsArray(currentCount, nextCount)
      const transition = current === next ? current : `${current} → ${next}`
      
      if (!result[region]) {
        result[region] = []
      }
      
      let timeframeEntry = result[region].find(entry => entry.timeframe === currentTimeperiod)
      if (!timeframeEntry) {
        timeframeEntry = { timeframe: currentTimeperiod, points: [], transition }
        result[region].push(timeframeEntry)
      }
      timeframeEntry.points.push(currentTimeperiodArray)

      if ((i + 1) % 2 === 0) {
        const nextIndex: number = timePeriods.indexOf(currentTimeperiod) + 1
        currentTimeperiod = timePeriods[nextIndex] ?? currentTimeperiod
      }
    }
  }

  return result
})
</script>
