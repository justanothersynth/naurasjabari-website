<template>
  <span class="moon-emoji text-5xl leading-none">{{ moonPhaseEmoji }}</span>
</template>

<script setup lang="ts">
/**
 * Simple moon component that displays moon phase emoji
 */
const props = defineProps<{
  phase: number
}>()

/**
 * Convert moon phase degrees to appropriate emoji
 * @param phase - Phase in degrees (0-360)
 * @returns Moon phase emoji
 */
 const moonPhaseEmoji = computed(() => {
  const normalizedPhase = ((props.phase % 360) + 360) % 360 // Ensure positive 0-360 range

  if (normalizedPhase >= 0 && normalizedPhase < 22.5) return '🌑' // New Moon
  if (normalizedPhase >= 22.5 && normalizedPhase < 67.5) return '🌒' // Waxing Crescent
  if (normalizedPhase >= 67.5 && normalizedPhase < 112.5) return '🌓' // First Quarter
  if (normalizedPhase >= 112.5 && normalizedPhase < 157.5) return '🌔' // Waxing Gibbous
  if (normalizedPhase >= 157.5 && normalizedPhase < 202.5) return '🌕' // Full Moon
  if (normalizedPhase >= 202.5 && normalizedPhase < 247.5) return '🌖' // Waning Gibbous
  if (normalizedPhase >= 247.5 && normalizedPhase < 292.5) return '🌗' // Third Quarter
  if (normalizedPhase >= 292.5 && normalizedPhase < 337.5) return '🌘' // Waning Crescent
  return '🌑' // 337.5-360 (New Moon)
})
</script>

<style lang="scss" scoped>
.moon-emoji {
  display: inline-block;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.1);
  }
}
</style>
