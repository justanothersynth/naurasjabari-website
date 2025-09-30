<template>
  <TooltipProvider>
    <div :class="['layout overflow-x-hidden', { 'force-cursor-pointer': forceCursorPointer }]">

      <slot />

      <!-- Global mouse-following tooltip -->
      <Teleport to="body">
        <div
          v-if="tooltip.show && tooltip.content"
          class="global-tooltip"
          :style="{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`
          }"
          v-html="tooltip.content" />
      </Teleport>

    </div>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'

const generalStore = useGeneralStore()
const { forceCursorPointer } = storeToRefs(generalStore)

const tooltipStore = useTooltipStore()
const { tooltip } = storeToRefs(tooltipStore)
</script>

<style lang="scss" scoped>
.layout {
  &.force-cursor-pointer {
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.global-tooltip {
  position: fixed;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: opacity 0.2s ease-in-out;
}
</style>
