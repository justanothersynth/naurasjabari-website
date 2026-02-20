<template>
  <NuxtImg
    ref="imageRef"
    preload
    format="webp"
    :src="src"
    :alt="alt"
    :style="tiltTransform"
    class="tilt-image" />
</template>

<script setup lang="ts">
import { useMouse, useElementVisibility, useDeviceOrientation } from '@vueuse/core'

type Props = {
  src: string
  alt: string
}

defineProps<Props>()

// Type for iOS 13+ DeviceOrientationEvent with requestPermission
type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>
}

const { x, y } = useMouse()
const { gamma, beta } = useDeviceOrientation()

// Track whether device has actual accelerometer data
const hasAccelerometer = ref(false)

// Smoothed rotation values for accelerometer
const smoothedRotateX = ref(0)
const smoothedRotateY = ref(0)

// Detect actual accelerometer data (not just API presence)
watchEffect(() => {
  if (gamma.value !== null && beta.value !== null) {
    hasAccelerometer.value = true
  }
})

/**
 * Linear interpolation for smooth transitions
 */
const lerp = (current: number, target: number, factor: number) => {
  return current + (target - current) * factor
}

/**
 * Apply dead zone to ignore micro-movements
 */
const applyDeadZone = (value: number, threshold: number) => {
  return Math.abs(value) < threshold ? 0 : value
}

/**
 * Request permission for device orientation on iOS 13+
 * Must be called from a user gesture (e.g., touch event)
 */
const requestOrientationPermission = async () => {
  const DeviceOrientation = DeviceOrientationEvent as DeviceOrientationEventWithPermission
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientation.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientation.requestPermission()
      return permission === 'granted'
    } catch {
      return false
    }
  }
  return true
}

// Smooth accelerometer values over time using requestAnimationFrame
let animationFrame: number

// Smoothing loop for accelerometer data
const smoothAccelerometer = () => {
  if (hasAccelerometer.value && gamma.value !== null && beta.value !== null) {
    // Calculate raw target values with dead zone applied
    // Negate gamma so tilting left shows left side of image (natural "window" effect)
    const rawRotateY = applyDeadZone(-gamma.value, 2) * 1.2
    const rawRotateX = applyDeadZone(beta.value - 45, 2) * 1.2

    // Clamp to max rotation
    const targetRotateY = Math.max(-25, Math.min(25, rawRotateY))
    const targetRotateX = Math.max(-25, Math.min(25, rawRotateX))

    // Smooth interpolation (0.15 = buttery smooth, higher = more responsive)
    smoothedRotateX.value = lerp(smoothedRotateX.value, targetRotateX, 0.15)
    smoothedRotateY.value = lerp(smoothedRotateY.value, targetRotateY, 0.15)
  }
  animationFrame = requestAnimationFrame(smoothAccelerometer)
}

// Request permission on first touch for iOS devices and start smoothing loop
onMounted(() => {
  const handleFirstTouch = async () => {
    await requestOrientationPermission()
    window.removeEventListener('touchstart', handleFirstTouch)
  }
  window.addEventListener('touchstart', handleFirstTouch, { once: true })
  animationFrame = requestAnimationFrame(smoothAccelerometer)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})

// Create template reference for the image
const imageRef = ref<HTMLImageElement>()

// Detect when the image is in viewport
const isImageVisible = useElementVisibility(imageRef)

// Store the last calculated transform value
const lastTransform = ref({
  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
})

/**
 * Calculate current tilt transformation based on accelerometer or mouse position
 * Prefers accelerometer when available, falls back to mouse
 */
const currentTransform = computed(() => {
  let rotateX = 0
  let rotateY = 0

  if (hasAccelerometer.value && gamma.value !== null && beta.value !== null) {
    // Use smoothed accelerometer values
    rotateX = smoothedRotateX.value
    rotateY = smoothedRotateY.value
  } else {
    // Fall back to mouse position
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    const offsetX = (x.value - centerX) / centerX
    const offsetY = (y.value - centerY) / centerY
    
    rotateY = offsetX * 15
    rotateX = -offsetY * 15
  }

  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
})

// Update last transform when image is visible
watchEffect(() => {
  if (isImageVisible.value) {
    lastTransform.value = currentTransform.value
  }
})

/**
 * Returns the appropriate transform based on viewport visibility
 * Uses current transform when visible, last calculated value when not visible
 */
const tiltTransform = computed(() => {
  return isImageVisible.value ? currentTransform.value : lastTransform.value
})
</script>

<style scoped>
.tilt-image {
  transition: transform 0.1s ease-out;
  will-change: transform;
}
</style>
