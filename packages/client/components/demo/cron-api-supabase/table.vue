<template>
  <div v-if="data.length > 0" class="relative grid grid-cols-4 gap-4 my-55 text-sm">

    <div
      v-for="location in locationKeys"
      :key="location"
      :class="['relative border-1 rounded-2xl p-4 bg-white transition-all duration-200', {
        'border-amber-200': data[0][location].period === 'day',
        'border-gray-300': data[0][location].period === 'night',
        'scale-103 shadow-lg': hoveredLocation === location
      }]"
      @mouseenter="hoveredLocation = location"
      @mouseleave="hoveredLocation = 'toronto'">

      <div
        class="specific-azimuth-indicator absolute -top-3 -right-3 w-10 h-10"
        @mouseenter="$tooltip.show(`Currently ${data[0][location].period === 'day' ? 'day ☀️' : 'night 🌙'}`)"
        @mouseleave="$tooltip.hide">
        <div
          class="needle sun before:bg-white"
          :style="{ transform: `translate(-50%, -50%) rotate(${data[0][location].sunAzimuth - 90}deg)` }" />
        <div
          class="needle moon before:bg-white"
          :style="{ transform: `translate(-50%, -50%) rotate(${data[0][location].moonAzimuth - 90}deg)` }" />
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
            <span class="lowercase">{{ getTime(data[0][location].sunriseTime) }}</span>
            <span class="text-xs">sunrise</span>
          </div>
        </div>
        <div class="flex">
          <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center">↓</span>
          <div class="flex flex-col">
            <span class="lowercase">{{ getTime(data[0][location].sunsetTime) }}</span>
            <span class="text-xs">sunset</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between font-mono mt-4">
        <div class="flex">
          <span class="p-1 pb-[1px] mr-2 w-4 h-4 flex items-center justify-center">☀️</span>
          {{ data[0][location].sunAzimuth.toFixed(3) }}
        </div>
        <div class="flex">
          <span class="p-1 pb-[1px] mr-2 w-4 h-4 flex items-center justify-center">🌗</span>
          {{ data[0][location].moonAzimuth.toFixed(3) }}
        </div>
      </div>

    </div>

    <div class="current-azimuth-indicator sun absolute top-15 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1/2 aspect-square border-1 border-dashed border-amber-300 rounded-full">
      <div class="absolute top-30 left-0 w-full flex items-center justify-center">
        <Icon name="iconoir:map-pin" size="16" class="mr-1" /> {{ data[0][hoveredLocation].period === 'day' ? 'Daytime' : 'Nighttime' }} in {{ useChangeCase(hoveredLocation, 'capitalCase') }}
        <span class="mx-2" />
        <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center font-mono">↑</span>
        <span class="lowercase">{{ getTime(data[0][hoveredLocation].sunriseTime) }}</span>
        <span class="mx-2" />
        <span class="bg-amber-100 rounded-full p-1 pb-[6px] mr-2 w-4 h-4 flex items-center justify-center font-mono">↓</span>
        <span class="lowercase">{{ getTime(data[0][hoveredLocation].sunsetTime) }}</span>
      </div>
      <div class="gradient sun absolute top-1/2 left-1/2 w-full h-1/2 -translate-x-1/2" />
      <div
        class="needle"
        :style="{ transform: `translate(-50%, -50%) rotate(${data[0][hoveredLocation].sunAzimuth - 90}deg)` }">
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
        :style="{ transform: `translate(-50%, -50%) rotate(${data[0][hoveredLocation].moonAzimuth - 90}deg)` }">
        <DemoCronApiSupabaseMoon :phase="data[0][hoveredLocation].moonPhase" />
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

// Get location keys dynamically from the sunMoonOrpcInput schema
const locationKeys = Object.keys(sunMoonOrpcInput.shape) as SunMoonLocationKey[]

// Track which location is currently hovered (defaults to toronto)
const hoveredLocation = ref<SunMoonLocationKey>('toronto')

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
 * Format time with consistent formatting (12-hour format with AM/PM, no spaces)
 * @param time - Time string to format
 * @returns Formatted time string in lowercase with no spaces
 */
const getTime = (time: string) => {
  return useFormatTime(time, { use24Hour: false, showAmPm: true }).replace(' ', '')
}

/**
 * Convert moon phase degrees to moon phase name and CSS class
 * @param phase - Phase in degrees (0-360)
 * @returns CSS class name for the moon phase
 */
const moonPhase = computed(() => {
  const normalizedPhase = ((props.data[0][hoveredLocation.value].moonPhase % 360) + 360) % 360 // Ensure positive 0-360 range
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
</style>
