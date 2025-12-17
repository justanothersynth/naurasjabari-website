<template>
  <Teleport to="body">
    <div
      v-if="tooltip.show && tooltip.content"
      ref="tooltipRef"
      class="global-tooltip"
      :style="{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`
      }"
      v-html="tooltip.content" />
  </Teleport>
</template>

<script lang="ts" setup>
const tooltipStore = useTooltipStore()
const { tooltip } = storeToRefs(tooltipStore)

const tooltipRef = ref<HTMLDivElement | null>(null)

/**
 * Calculates the adjusted tooltip position to prevent it from going off-screen
 * @returns The adjusted x and y coordinates for the tooltip
 */
const adjustedPosition = computed(() => {
  // Default offset from cursor
  const offset = 15
  let x = tooltip.value.x + offset
  let y = tooltip.value.y + offset

  // Only adjust if tooltip element is rendered and we can measure it
  if (tooltipRef.value && import.meta.client) {
    const rect = tooltipRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Adjust horizontal position if tooltip would overflow right edge
    if (x + rect.width > viewportWidth) {
      x = tooltip.value.x - rect.width - 6
    }

    // Adjust vertical position if tooltip would overflow bottom edge
    if (y + rect.height > viewportHeight) {
      y = tooltip.value.y - rect.height - 6
    }

    // Ensure tooltip doesn't go off left edge
    if (x < 8) {
      x = 6
    }

    // Ensure tooltip doesn't go off top edge
    if (y < 8) {
      y = 6
    }
  }

  return { x, y }
})
</script>

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
