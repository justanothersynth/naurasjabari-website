<template>
  <section
    ref="hexCanvasRef"
    class="hex-canvas w-full h-full relative"
    @mousemove="throttledMouseMove"
    @mouseleave="handleMouseLeave">
    
    <div
      ref="hexCanvasInnerRef"
      :style="{ transform: `translate(${hexCanvasTranslation.x}px, ${hexCanvasTranslation.y}px)` }"
      :class="['hex-canvas-inner absolute inset-0', { 'mouse-reveal-active': isMouseRevealActive }]">
      
      <slot />
      
    </div>
    
  </section>
</template>

<script setup lang="ts">
import { useElementVisibility, useMouse, useElementBounding } from '@vueuse/core'
import type { Hexagon } from '@/types/hexagon'

const props = withDefaults(defineProps<{
  showBlueprint?: boolean
  showOutline?: boolean
}>(), {
  showBlueprint: false,
  showOutline: false
})

const { $bus } = useNuxtApp()

const generalStore = useGeneralStore()
const { forceCursorPointer } = storeToRefs(generalStore)
const hexStore = useHexagonStore()
const { hexCanvasTranslation, hexagons } = storeToRefs(hexStore)
const hexCanvasRef = ref<HTMLElement | null>(null)
const hexCanvasInnerRef = ref<HTMLElement | null>(null)

// Track mouse position within the canvas
const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })

// Track canvas element bounds
const canvasBounds = useElementBounding(hexCanvasRef)

// Track content bounds (extent of all hexagons)
const contentBounds = ref({
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0
})

// Whether mouse reveal is active (has content extending beyond viewport)
const isMouseRevealActive = ref(false)

// Extra padding added to movement distance
// Allows to compensate for circular parent component
const mouseRevealPadding = 250

/**
 * Calculates the bounding box of all registered hexagon content
 * Uses actual screen coordinates relative to canvas center
 */
const calculateContentBounds = () => {
  if (hexagons.value.size === 0 || !hexCanvasRef.value) return

  // Get canvas center in screen coordinates
  const canvasRect = hexCanvasRef.value.getBoundingClientRect()
  const canvasCenterX = canvasRect.left + canvasRect.width / 2
  const canvasCenterY = canvasRect.top + canvasRect.height / 2

  let minX = 0
  let maxX = 0
  let minY = 0
  let maxY = 0

  hexagons.value.forEach((hexagon: Hexagon) => {
    const { ref } = hexagon
    if (!ref) return

    // Get fresh bounding rect for each hexagon
    const rect = ref.getBoundingClientRect()
    
    // Calculate hexagon edges relative to canvas center
    const left = rect.left - canvasCenterX
    const right = rect.right - canvasCenterX
    const top = rect.top - canvasCenterY
    const bottom = rect.bottom - canvasCenterY

    minX = Math.min(minX, left)
    maxX = Math.max(maxX, right)
    minY = Math.min(minY, top)
    maxY = Math.max(maxY, bottom)
  })

  contentBounds.value = { minX, maxX, minY, maxY }

  // Check if content extends beyond the canvas viewport in any direction
  const canvasHalfWidth = canvasBounds.width.value / 2
  const canvasHalfHeight = canvasBounds.height.value / 2
  isMouseRevealActive.value = (
    maxX > canvasHalfWidth ||      // content extends beyond right edge
    -minX > canvasHalfWidth ||     // content extends beyond left edge
    maxY > canvasHalfHeight ||     // content extends beyond bottom edge
    -minY > canvasHalfHeight       // content extends beyond top edge
  )
}

/**
 * Computes canvas translation based on mouse position
 * Mouse at center = no translation
 * Mouse toward edge = reveal that edge (translate opposite direction)
 */
const computeMouseRevealTranslation = () => {
  if (!isMouseRevealActive.value || !hexCanvasRef.value) return

  const { width, height, left, top } = canvasBounds

  // Calculate canvas center in viewport coordinates
  const canvasCenterX = left.value + width.value / 2
  const canvasCenterY = top.value + height.value / 2

  // Normalize mouse position to -1 to 1 range
  const normalizedX = Math.max(-1, Math.min(1, (mouseX.value - canvasCenterX) / (width.value / 2)))
  const normalizedY = Math.max(-1, Math.min(1, (mouseY.value - canvasCenterY) / (height.value / 2)))

  const canvasHalfWidth = width.value / 2
  const canvasHalfHeight = height.value / 2

  // Calculate overflow for each direction independently
  // overflowRight: how much content exceeds the right edge (maxX is positive)
  // overflowLeft: how much content exceeds the left edge (minX is negative)
  // Add padding to compensate for circular viewport clipping
  const overflowRight = Math.max(0, contentBounds.value.maxX - canvasHalfWidth) + mouseRevealPadding
  const overflowLeft = Math.max(0, -contentBounds.value.minX - canvasHalfWidth) + mouseRevealPadding
  const overflowBottom = Math.max(0, contentBounds.value.maxY - canvasHalfHeight) + mouseRevealPadding
  const overflowTop = Math.max(0, -contentBounds.value.minY - canvasHalfHeight) + mouseRevealPadding

  // Calculate translation based on mouse direction
  // Mouse right (normalizedX > 0) → reveal right side → translate left (negative)
  // Mouse left (normalizedX < 0) → reveal left side → translate right (positive)
  let translationX = 0
  if (normalizedX >= 0) {
    translationX = -normalizedX * overflowRight
  } else {
    translationX = -normalizedX * overflowLeft
  }

  let translationY = 0
  if (normalizedY >= 0) {
    translationY = -normalizedY * overflowBottom
  } else {
    translationY = -normalizedY * overflowTop
  }

  hexStore.setHexCanvasTranslation({
    x: translationX,
    y: translationY
  })
}

// Throttled mouse reveal update
const throttledMouseReveal = useThrottleFn(computeMouseRevealTranslation, 16)

// Watch for mouse movement when reveal is active
watch([mouseX, mouseY], () => {
  if (isMouseRevealActive.value) {
    throttledMouseReveal()
  }
})

// Detect when the canvas is in viewport
const canvasIsVisible = useElementVisibility(hexCanvasRef)

// Update store when canvas visibility changes
watchEffect(() => {
  hexStore.setCanvasIsInViewport(canvasIsVisible.value)
})

provide('hexCanvasRef', hexCanvasRef)
provide('hexCanvasShowBlueprint', toRef(() => props.showBlueprint))
provide('hexCanvasShowOutline', toRef(() => props.showOutline))

const throttledMouseMove = useThrottleFn(() => {
  if (hexStore.isHoveringCanvas) return
  hexStore.setIsHoveringCanvas(hexCanvasRef.value)
}, 100)

const handleMouseLeave = () => {
  hexStore.setIsHoveringCanvas(null)
  if (forceCursorPointer.value) {
    generalStore.setForceCursorPointer(false)
  }
}

const handleTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'transform') {
    $bus.$emit('hex-canvas-shift-complete')
  }
}

const handleHexReset = () => {
  hexCanvasTranslation.value = { x: 0, y: 0 }
}

/**
 * Handles hexagon registration events to recalculate content bounds
 */
const handleHexagonRegistered = () => {
  calculateContentBounds()
}

$bus.$on('hex-reset', handleHexReset)
$bus.$on('hexagon-registered', handleHexagonRegistered)

onMounted(() => {
  hexCanvasInnerRef.value?.addEventListener('transitionend', handleTransitionEnd)
  // Calculate initial bounds if hexagons are already registered
  calculateContentBounds()
})

onBeforeUnmount(() => {
  hexCanvasInnerRef.value?.removeEventListener('transitionend', handleTransitionEnd)
  $bus.$off('hex-reset', handleHexReset)
  $bus.$off('hexagon-registered', handleHexagonRegistered)
})
</script>

<style lang="scss" scoped>
.hex-canvas-inner {
  transition: transform 500ms ease-in-out;
  &.mouse-reveal-active {
    transition: transform 100ms ease-out;
  }
}
</style>
