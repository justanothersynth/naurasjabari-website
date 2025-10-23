<template>
  <TooltipRoot :delay-duration="0">
    
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    
    <TooltipPortal>
      <TooltipContent
        :side="side"
        :side-offset="sideOffset"
        :align="align"
        as-child>
        <Motion
          :initial="{ opacity: 0, x: initialX, y: initialY }"
          :animate="{ opacity: 1, x: 0, y: 0 }"
          :exit="{ opacity: 0, x: initialX, y: initialY }"
          :transition="{ duration: animationDuration, ease: 'easeIn' }"
          :class="useCn(
            'z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-md pointer-events-none',
            props.class
          )">
          {{ text }}
        </Motion>
      </TooltipContent>
    </TooltipPortal>
    
  </TooltipRoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal
  
} from 'reka-ui'
import type {TooltipRootProps} from 'reka-ui';
import { Motion } from 'motion-v'

interface Props extends TooltipRootProps {
  text: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  animationDuration?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  side: 'bottom',
  sideOffset: 8,
  align: 'center',
  animationDuration: 0.2,
  class: ''
})

// Calculate initial Y position based on side
const initialY = computed(() => {
  switch (props.side) {
    case 'top': return -4
    case 'bottom': return 4
    case 'left':
    case 'right': return 0
    default: return -4
  }
})

// Calculate initial X position based on side
const initialX = computed(() => {
  switch (props.side) {
    case 'left': return -4
    case 'right': return 4
    case 'top':
    case 'bottom': return 0
    default: return 0
  }
})
</script>
