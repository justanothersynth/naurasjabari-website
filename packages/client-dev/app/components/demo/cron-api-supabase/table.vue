<template>
  <div v-if="data.length > 0" class="relative grid grid-cols-4 gap-4 my-55 text-sm">

    <div
      v-for="location in locationKeys"
      :key="location"
      :class="['relative border-1 rounded-2xl p-4 bg-white transition-all duration-200', {
        'border-amber-200': data[0]?.[location]?.period === 'day',
        'border-gray-300': data[0]?.[location]?.period === 'night',
        'scale-103 shadow-lg': hoveredLocation === location
      }]"
      @mouseenter="hoveredLocation = location"
      @mouseleave="hoveredLocation = 'toronto'">

      <div
        class="specific-azimuth-indicator absolute -top-3 -right-3 w-10 h-10"
        @mouseenter="$tooltip.show(`Currently ${data[0]?.[location]?.period === 'day' ? 'day ☀️' : 'night 🌙'}`)"
        @mouseleave="$tooltip.hide">
        <div
          class="needle sun before:bg-white"
          :style="{ transform: `translate(-50%, -50%) rotate(${(data[0]?.[location]?.sunAzimuth ?? 0) - 90}deg)` }" />
        <div
          class="needle moon before:bg-white"
          :style="{ transform: `translate(-50%, -50%) rotate(${(data[0]?.[location]?.moonAzimuth ?? 0) - 90}deg)` }" />
        <div class="container sun absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1/2" />
        <div class="container moon absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1/2" />
      </div>
      
      <div class="mb-2 font-semibold">
        <a :href="links[location]" target="_blank" class="hover:text-blue-700 hover:underline transition-colors transition-150">
          {{ useChangeCase(location, 'capitalCase') }} <Icon name="iconoir:arrow-up-right-square" size="12" />
        </a>
      </div>

      <div class="flex items-center justify-between font-mono">
        <div class="flex">
          <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center">↑</span>
          <div class="flex flex-col">
            <span class="lowercase">{{ getTime(data[0]?.[location]?.sunriseTime ?? '', location) }}</span>
            <span class="text-xs">sunrise</span>
          </div>
        </div>
        <div class="flex">
          <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center">↓</span>
          <div class="flex flex-col">
            <span class="lowercase">{{ getTime(data[0]?.[location]?.sunsetTime ?? '', location) }}</span>
            <span class="text-xs">sunset</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between font-mono mt-4 gap-x-2 text-sm">
        <div class="flex">
          <span class="p-1 pb-[1px] mr-1 w-4 h-4 flex items-center justify-center">☀️</span>
          <span class="azimuth-digits">
            <span
              v-for="(char, idx) in toDigitArray(data[0]?.[location]?.sunAzimuth)"
              :key="`sun-${location}-${idx}`"
              :class="{ 'azimuth-flash': flashingDigits[location]?.sun?.[idx] }">{{ char }}</span>
          </span>
        </div>
        <div class="flex">
          <span class="p-1 pb-[1px] mr-1 w-4 h-4 flex items-center justify-center">🌗</span>
          <span class="azimuth-digits">
            <span
              v-for="(char, idx) in toDigitArray(data[0]?.[location]?.moonAzimuth)"
              :key="`moon-${location}-${idx}`"
              :class="{ 'azimuth-flash': flashingDigits[location]?.moon?.[idx] }">{{ char }}</span>
          </span>
        </div>
      </div>

    </div>

    <div class="current-azimuth-indicator sun absolute top-15 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1/2 aspect-square border-1 border-dashed border-amber-300 rounded-full">
      <div class="absolute top-30 left-0 w-full flex items-center justify-center">
        <Icon name="iconoir:map-pin" size="16" class="mr-1" /> {{ data[0]?.[hoveredLocation]?.period === 'day' ? 'Daytime' : 'Nighttime' }} in {{ useChangeCase(hoveredLocation, 'capitalCase') }}
        <span class="mx-2" />
        <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center font-mono">↑</span>
        <span class="lowercase">{{ getTime(data[0]?.[hoveredLocation]?.sunriseTime ?? '', hoveredLocation) }}</span>
        <span class="mx-2" />
        <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center font-mono">↓</span>
        <span class="lowercase">{{ getTime(data[0]?.[hoveredLocation]?.sunsetTime ?? '', hoveredLocation) }}</span>
      </div>
      <div class="gradient sun absolute top-1/2 left-1/2 w-full h-1/2 -translate-x-1/2" />
      <div
        class="needle"
        :style="{ transform: `translate(-50%, -50%) rotate(${(data[0]?.[hoveredLocation]?.sunAzimuth ?? 0) - 90}deg)` }">
        <DemoCronApiSupabaseSun />
      </div>
    </div>

    <div class="current-azimuth-indicator moon absolute bottom-15 left-1/2 translate-y-1/2 -translate-x-1/2 w-1/2 aspect-square border-1 border-dashed border-gray-300 rounded-full">
      <div class="absolute bottom-25 left-0 w-full flex items-center justify-center">
        Currently a {{ moonPhase }} Moon
      </div>
      <div class="gradient moon absolute top-1/2 left-1/2 w-full h-1/2 -translate-x-1/2" />
      <div
        class="needle"
        :style="{ transform: `translate(-50%, -50%) rotate(${(data[0]?.[hoveredLocation]?.moonAzimuth ?? 0) - 90}deg)` }">
        <DemoCronApiSupabaseMoon :phase="data[0]?.[hoveredLocation]?.moonPhase ?? 0" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useChangeCase } from '@vueuse/integrations/useChangeCase'
import type { SunMoonSupabase, SunMoonLocationKey } from '@workspace/types'
import { sunMoonOrpcInput } from '@workspace/types'

const props = defineProps<{
  data: SunMoonSupabase[]
}>()

const { $tooltip } = useNuxtApp()

// Get location keys dynamically from the sunMoonOrpcInput schema
const locationKeys = Object.keys(sunMoonOrpcInput.shape) as SunMoonLocationKey[]

// Track which individual digits should flash (per location, per type, per digit index)
type DigitFlashState = Record<SunMoonLocationKey, { sun: boolean[], moon: boolean[] }>
const flashingDigits = ref<Partial<DigitFlashState>>({})

// Store previous azimuth string values for digit comparison
const previousAzimuthStrings = ref<Record<SunMoonLocationKey, { sun: string, moon: string }>>({} as Record<SunMoonLocationKey, { sun: string, moon: string }>)

/**
 * Converts a number to an array of characters for digit-by-digit rendering
 * @param value - The number to convert
 * @returns Array of individual characters (digits and decimal point)
 */
const toDigitArray = (value: number | null | undefined): string[] => {
  return (value ?? 0).toFixed(3).split('')
}

/**
 * Compares two digit arrays and returns which indices changed
 * @param oldDigits - Previous digit array
 * @param newDigits - New digit array
 * @returns Array of booleans indicating which indices changed
 */
const compareDigits = (oldDigits: string[], newDigits: string[]): boolean[] => {
  const maxLen = Math.max(oldDigits.length, newDigits.length)
  const result: boolean[] = []
  for (let i = 0; i < maxLen; i++) {
    result.push(oldDigits[i] !== newDigits[i])
  }
  return result
}

/**
 * Watches for changes in azimuth data and triggers flash animation for changed digits
 */
watch(() => props.data[0], (newData, oldData) => {
  if (!newData || !oldData) return
  
  const newFlashState: Partial<DigitFlashState> = {}
  
  for (const location of locationKeys) {
    const prevSunStr = previousAzimuthStrings.value[location]?.sun ?? (oldData[location]?.sunAzimuth ?? 0).toFixed(3)
    const prevMoonStr = previousAzimuthStrings.value[location]?.moon ?? (oldData[location]?.moonAzimuth ?? 0).toFixed(3)
    const newSunStr = (newData[location]?.sunAzimuth ?? 0).toFixed(3)
    const newMoonStr = (newData[location]?.moonAzimuth ?? 0).toFixed(3)
    
    const sunDigitChanges = compareDigits(prevSunStr.split(''), newSunStr.split(''))
    const moonDigitChanges = compareDigits(prevMoonStr.split(''), newMoonStr.split(''))
    
    const hasSunChanges = sunDigitChanges.some(changed => changed)
    const hasMoonChanges = moonDigitChanges.some(changed => changed)
    
    if (hasSunChanges || hasMoonChanges) {
      newFlashState[location] = {
        sun: sunDigitChanges,
        moon: moonDigitChanges
      }
    }
    
    // Update previous values
    previousAzimuthStrings.value[location] = { sun: newSunStr, moon: newMoonStr }
  }
  
  flashingDigits.value = newFlashState
  
  // Clear flash state after animation
  setTimeout(() => {
    flashingDigits.value = {}
  }, 500)
}, { deep: true })

// Track which location is currently hovered (defaults to toronto)
const hoveredLocation = ref<SunMoonLocationKey>('toronto')

/**
 * Links to the locations on Google Maps.
 */
const links = {
  toronto: 'https://maps.app.goo.gl/kuaFvAL398Gm2k6j6',
  vancouver: 'https://maps.app.goo.gl/9xjuy64k1pCQZWhh6',
  kosiv: 'https://maps.app.goo.gl/YP5AQwxLKFkzT1xbA',
  montreal: 'https://maps.app.goo.gl/34TfoAha2iFcriGN9',
  heidelberg: 'https://maps.app.goo.gl/8NpUAogYpZYxjXvi6',
  bristol: 'https://maps.app.goo.gl/PsUS9WFdLDVmj9D87',
  snowdonia: 'https://maps.app.goo.gl/eLcepJZ1ZRrddFxR8',
  sayulita: 'https://maps.app.goo.gl/TTN9w2XXigBxjMfHA'
}

/**
 * IANA timezone identifiers for each location.
 * These properly handle daylight savings time transitions.
 */
const timezones: Record<SunMoonLocationKey, string> = {
  toronto: 'America/Toronto',
  vancouver: 'America/Vancouver',
  kosiv: 'Europe/Kyiv',
  montreal: 'America/Toronto',
  heidelberg: 'Europe/Berlin',
  bristol: 'Europe/London',
  snowdonia: 'Europe/London',
  sayulita: 'America/Mazatlan'
}

/**
 * Format time with consistent formatting (12-hour format with AM/PM, no spaces)
 * @param time - Time string to format
 * @param location - Location key to determine the correct timezone (handles DST)
 * @returns Formatted time string in lowercase with no spaces
 */
const getTime = (time: string, location: SunMoonLocationKey) => {
  return useFormatTime(time, {
    timezone: timezones[location],
    includeTimezoneOffset: true,
    use24Hour: false,
    showAmPm: true
  }).replace(' ', '')
}

/**
 * Convert moon phase degrees to moon phase name and CSS class
 * @param phase - Phase in degrees (0-360)
 * @returns CSS class name for the moon phase
 */
const moonPhase = computed(() => {
  const normalizedPhase = (((props.data[0]?.[hoveredLocation.value]?.moonPhase ?? 0) % 360) + 360) % 360 // Ensure positive 0-360 range
  if (normalizedPhase >= 0 && normalizedPhase < 22.5) return 'New'
  if (normalizedPhase >= 22.5 && normalizedPhase < 67.5) return 'Waxing Crescent'
  if (normalizedPhase >= 67.5 && normalizedPhase < 112.5) return 'First Quarter'
  if (normalizedPhase >= 112.5 && normalizedPhase < 157.5) return 'Waxing Gibbous'
  if (normalizedPhase >= 157.5 && normalizedPhase < 202.5) return 'Full'
  if (normalizedPhase >= 202.5 && normalizedPhase < 247.5) return 'Waning Gibbous'
  if (normalizedPhase >= 247.5 && normalizedPhase < 292.5) return 'Third Quarter'
  if (normalizedPhase >= 292.5 && normalizedPhase < 337.5) return 'Waning Crescent'
  return 'New Moon' // 337.5-360
})
</script>

<style lang="scss" scoped>
.specific-azimuth-indicator {
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    transform: translate(-50%, -50%);
    background: radial-gradient(white 20%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

.specific-azimuth-indicator .container {
  position: absolute;
  overflow: hidden;
  &:before {
    content: '';
    position: absolute;
    height: calc(var(--spacing) * 6);
    width: calc(var(--spacing) * 6);
    border: 2px solid;
    border-radius: 50%;
  }
  &.sun {
    &:before {
      top: calc(var(--spacing) * 2);
      border-color: var(--color-amber-300);
    }
  }
  &.moon {
    &:before {
      bottom: calc(var(--spacing) * 2);
      border-color: var(--color-gray-300);
    }
  }
}

.specific-azimuth-indicator .needle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: calc(var(--spacing) * 4.5);
  z-index: 10;
  &:before,
  &:after {
    content: '';
    position: absolute;
  }
  &:before {
    top: calc(-6px - 2px);
    left: calc(0px - 2px);
    width: calc(100% + 4px);
    height: calc(12px + 4px);
    border-radius: 2px;
  }
  &:after {
    top: -6px;
    left: 0;
    width: 100%;
    height: 8px;
    border-radius: 2px;
  }
  &.sun {
    &:after {
      background-color: var(--color-amber-500);
    }
  }
  &.moon {
    &:after {
      background-color: var(--color-gray-500);
    }
  }
}

.current-azimuth-indicator {
  pointer-events: none;
  z-index: -1;
  &.moon {
    &:before {
      content: '';
      position: absolute;
      bottom: 83%;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      height: 5rem;
      background-color: white;
    }
  }
}

.current-azimuth-indicator .gradient {
  z-index: 10;
  &:before,
  &:after {
    content: '';
    position: absolute;
    left: 0;
    width: 200%;
    transform: translateX(-25%);
  }
  &.sun {
    &:before {
      bottom: 100%;
      height: 5rem;
      background: linear-gradient(to top, white 40%, transparent);
    }
    &:after {
      top: 0;
      height: calc(100% + 4px);
      background-color: white;
    }
  }
  &.moon {
    &:before {
      bottom: 100%;
      height: calc(100% + 4px);
      background: linear-gradient(to top, white 90%, transparent);
    }
    &:after {
      top: 0;
      height: 5rem;
      background: linear-gradient(to bottom, white 40%, transparent);
    }
  }
}

.current-azimuth-indicator .needle {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 112%;
  z-index: 5;
  transition: transform 0.3s ease-in-out;
}

@keyframes azimuth-flash {
  0% { background-color: transparent; }
  50% { background-color: var(--color-gray-300); }
  100% { background-color: transparent; }
}

.azimuth-digits {
  display: inline-flex;
}

.azimuth-digits > span {
  display: inline-block;
  min-width: 0.6rem;
  text-align: center;
  border-radius: 2px;
}

.azimuth-flash {
  animation: azimuth-flash 0.5s ease-in-out;
}
</style>
