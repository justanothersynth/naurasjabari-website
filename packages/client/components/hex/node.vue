<template>
  <div
    ref="hexNodeRef"
    :style="{
      transform: hexNodeTransform,
      opacity: smoothOpacity
    }"
    :class="['hex-node', { selected: isSelected }]">

    <slot />

  </div>
</template>

<script setup lang="ts">
import { TransitionPresets, useTransition } from '@vueuse/core'

import type { HexNode } from '@/types/hexagon'

const props = withDefaults(defineProps<{
  name: string
  attachedTo?: string
  url?: string
  radius?: number
  angle?: number
  parallaxIntensity?: number
  maxDistanceForFullOpacity?: number
  maxFadeDistance?: number
}>(), {
  attachedTo: 'origin',
  url: '/',
  radius: 0,
  angle: 0,
  parallaxIntensity: 50,
  maxDistanceForFullOpacity: 200,
  maxFadeDistance: 500
})

provide('belongsToHexNode', props.name)

const settings = {
  minOpacity: 0.1,
  dampeningFactor: 0.2,
  smoothOpacityDuration: 1,
  opacityUnselectedHexNode: 0.6,
  opacitySelectedHexNode: 1
}

const { $bus } = useNuxtApp()
const store = useHexagonStore()
const {
  selectedHexNode
} = storeToRefs(store)
const hexNodeRef = ref<HTMLElement | null>(null)
const hexNodeOffset = ref('')

// Client-only parallax to avoid SSR hydration issues
const isMounted = ref(false)

// Parallax implementation using useParallax (tracks entire viewport via document.body)
const { tilt: parallaxTilt, roll: parallaxRoll } = useParallax(typeof document !== 'undefined' ? document.body : null)

// Mouse tracking relative to viewport for opacity animation
const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })

// Track if mouse has moved from initial position
const mouseHasMoved = computed(() => {
  return mouseX.value !== 0 || mouseY.value !== 0
})

const selectedHexNodeName = computed(() => {
  return selectedHexNode.value?.name
})

/**
 * Calculate parallax offset using useParallax composable
 * Uses pre-scaled tilt/roll values (-0.5 to 0.5) with inverse scaling
 */
const parallaxOffset = computed(() => {
  // Return zero offset during SSR to match server-rendered content
  if (!isMounted.value) return { x: 0, y: 0 }
  const dampening = selectedHexNodeName.value === props.name ? 1 : settings.dampeningFactor
  return {
    x: -parallaxTilt.value * props.parallaxIntensity * dampening,
    y: parallaxRoll.value * props.parallaxIntensity * dampening
  }
})

/**
 * Combined transform that includes both positional offset and parallax effect
 */
const hexNodeTransform = computed(() => {
  // Base transform for radial positioning
  const baseTransform = hexNodeOffset.value || 'translate(-50%, -50%)'
  // Add parallax offset to the base transform (zero during SSR)
  const parallaxTransform = `translate(${parallaxOffset.value.x}px, ${parallaxOffset.value.y}px)`
  return `${baseTransform} ${parallaxTransform}`
})

const isSelected = computed(() => {
  if (!isMounted.value) return false
  return selectedHexNodeName.value === props.name
})

/**
 * Calculate the radial position of the hex node
 * @param radius - The radius of the hex node
 * @param angleInDegrees - The angle of the hex node in degrees
 * @returns The x and y coordinates of the hex node
 */
const calculateRadialPosition = (radius: number, angleInDegrees: number) => {
  const angleInRadians = angleInDegrees * (Math.PI / 180)
  return {
    x: radius * Math.sin(angleInRadians),
    y: -radius * Math.cos(angleInRadians)
  }
}

/**
 * Position the hex node along a radius from the center of the hex node
 * @param targetRadius - The radius of the hex node
 * @param targetAngle - The desired angle of the hex node, in degrees
 */
const positionAlongRadius = (targetRadius: number, targetAngle: number) => {
  const { x, y } = calculateRadialPosition(targetRadius, targetAngle)
  if (hexNodeRef.value) {
    hexNodeOffset.value = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
  }
}

/**
 * Get the hex node's center position relative to the viewport
 */
const getHexNodeViewportPosition = () => {
  if (!hexNodeRef.value || !isMounted.value) return { x: 0, y: 0 }
  
  const rect = hexNodeRef.value.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

/**
 * Calculate opacity based on mouse distance from hex node center in viewport
 * @returns Opacity value between 0 and 1 based on mouse proximity to hex node
 */
const calculateProximityOpacity = computed(() => {
  if (!isMounted.value || !hexNodeRef.value) return settings.minOpacity

  // If mouse hasn't moved yet, return initial opacity
  if (!mouseHasMoved.value) {
    return isSelected.value
      ? settings.opacitySelectedHexNode
      : settings.minOpacity
  }

  const hexNodePosition = getHexNodeViewportPosition()
  
  // Calculate distance from mouse to hex node center
  const deltaX = mouseX.value - hexNodePosition.x
  const deltaY = mouseY.value - hexNodePosition.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  // If mouse is within the radius, opacity is always 1
  if (distance <= props.maxDistanceForFullOpacity) {
    return isSelected.value ? settings.opacitySelectedHexNode : settings.opacityUnselectedHexNode
  }
  
  // If mouse is outside the radius, opacity transitions from 1 (at radius) to 0.3 (at maxFadeDistance)
  const fadeDistance = distance - props.maxDistanceForFullOpacity
  const fadeRange = props.maxFadeDistance - props.maxDistanceForFullOpacity
  const normalizedFadeDistance = Math.min(fadeDistance / fadeRange, 1)
  let opacity = settings.opacityUnselectedHexNode - (normalizedFadeDistance * (settings.opacityUnselectedHexNode - settings.minOpacity)) // Range from 1 to minOpacity
  if (isSelected.value) {
    opacity = settings.opacitySelectedHexNode - (normalizedFadeDistance * (settings.opacitySelectedHexNode - settings.minOpacity)) // Range from 1 to minOpacity
  }
  
  return Math.max(opacity, settings.minOpacity) // Ensure minimum opacity of minOpacity
})

// Smooth opacity transition using useTransition
const smoothOpacity = useTransition(calculateProximityOpacity, {
  duration: settings.smoothOpacityDuration,
  transition: TransitionPresets.linear
})

const handleHexNodeTriggered = (event: unknown) => {
  const { name } = event as HexNode
  if (name === props.name) {
    store.setSelectedHexNode({
      ref: hexNodeRef.value,
      name: props.name,
      url: props.url,
      attachedTo: props.attachedTo,
      radius: props.radius
    } as HexNode)
  }
}

const handleHexNodeMounted = (event: unknown) => {
  const { name, radius } = event as HexNode
  if (props.attachedTo === name) {
    positionAlongRadius(radius, props.angle)
  }
}

$bus.$on('hex-node-mounted', handleHexNodeMounted)
$bus.$on('hex-node-triggered', handleHexNodeTriggered)

onMounted(() => {
  const data: HexNode = {
    ref: hexNodeRef.value,
    name: props.name,
    url: props.url,
    attachedTo: props.attachedTo,
    radius: props.radius
  }
  store.registerHexNode(data)
  if (props.attachedTo === 'origin') {
    store.setSelectedHexNode(data)
  }
  $bus.$emit('hex-node-mounted', data)
  isMounted.value = true
})

onBeforeUnmount(() => {
  $bus.$off('hex-node-mounted', handleHexNodeMounted)
  $bus.$off('hex-node-triggered', handleHexNodeTriggered)
})
</script>

<style lang="scss" scoped>
.hex-node {
  position: fixed;
  top: 50%;
  left: 50%;
  font-size: toRem(12);
  &:not(.selected) {
    pointer-events: none;
  }
}

.overlay {
  position: absolute;
  bottom: 0;
  left: -50vw;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to top, var(--color-pale), transparent);
  opacity: 0;
  z-index: 100;
  pointer-events: none;
  transition: opacity 300ms ease-in-out;
  &:after {
    content: '';
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, var(--color-pale));
  }
  &.visible {
    opacity: 1;
    pointer-events: all;
  }
}
</style>
