<template>
  <component
    :is="tag"
    ref="containerRef"
    :aria-label="`View image: ${alt}`"
    :class="cn('relative inline-block w-full h-full bg-gray-fill', containerClass)">

    <Transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div v-if="!isLoaded" class="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <LoaderSpinner :duration="1.75" class="text-gray-400" />
        <span v-if="displayLoadingText" class="text-gray-500">loading{{ ellipsis }}</span>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div v-if="showError" class="absolute inset-0 flex items-center justify-center">
        <Icon name="iconoir:media-image-xmark" size="24" class="text-gray-400" />
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <NuxtImg
        v-if="shouldLoad"
        v-show="showImage"
        preload
        format="webp"
        :src="src"
        :alt="alt"
        :width="width !== -1 ? width : undefined"
        :height="height !== -1 ? height : undefined"
        :class="cn(imageClass)"
        @load="handleLoad"
        @error="handleError" />
    </Transition>

  </component>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  src: string
  alt?: string
  imageClass?: string
  containerClass?: string
  /** Root element tag. Defaults to 'div' */
  tag?: string
  /** Threshold for when to trigger loading (0-1). Defaults to 0.1 */
  threshold?: number
  /** Root margin for intersection observer. Defaults to '50px' */
  rootMargin?: string,
  width?: number
  height?: number
  displayLoadingText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  containerClass: '',
  tag: 'div',
  threshold: 0.1,
  rootMargin: '50px',
  width: -1,
  height: -1,
  displayLoadingText: false
})

const cn = useCn

const containerRef = ref<HTMLElement | null>(null)
const shouldLoad = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const showImage = ref(false)
const showError = ref(false)

// Dynamic ellipsis state
const ellipsisCount = ref(0)
let ellipsisInterval: NodeJS.Timeout | null = null

/**
 * Computed property that returns the ellipsis string based on count
 */
const ellipsis = computed(() => '.'.repeat(ellipsisCount.value))

/**
 * Starts the ellipsis animation
 */
function startEllipsisAnimation() {
  if (ellipsisInterval) return
  
  ellipsisInterval = setInterval(() => {
    ellipsisCount.value = (ellipsisCount.value + 1) % 4
  }, 300) // 500ms interval between each dot
}

/**
 * Stops the ellipsis animation and cleans up
 */
function stopEllipsisAnimation() {
  if (ellipsisInterval) {
    clearInterval(ellipsisInterval)
    ellipsisInterval = null
    ellipsisCount.value = 0
  }
}

/**
 * Handles successful image load
 */
function handleLoad() {
  isLoaded.value = true
}

/**
 * Handles image load error
 */
function handleError() {
  hasError.value = true
  isLoaded.value = true // Still hide spinner even on error
}

// Watch for load completion and delay showing content until spinner fades out
watch(isLoaded, loaded => {
  if (loaded) {
    stopEllipsisAnimation()
    // Wait for spinner fade-out (300ms) before fading in the content
    setTimeout(() => {
      if (hasError.value) {
        showError.value = true
      } else {
        showImage.value = true
      }
    }, 300)
  }
})

// Start ellipsis animation when loading begins
watch(shouldLoad, loading => {
  if (loading && !isLoaded.value && props.displayLoadingText) {
    startEllipsisAnimation()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopEllipsisAnimation()
})

// Set up intersection observer to trigger loading when in viewport
useIntersectionObserver(
  containerRef,
  ([entry]) => {
    if (entry?.isIntersecting && !shouldLoad.value) {
      shouldLoad.value = true
    }
  },
  {
    threshold: props.threshold,
    rootMargin: props.rootMargin
  }
)
</script>
