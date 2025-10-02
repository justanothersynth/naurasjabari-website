<template>
  <component :is="tag" ref="containerRef" :class="useCn('relative inline-block w-full h-full bg-gray-fill', containerClass)">

    <Transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center">
        <LoaderSpinner :duration="1.75" class="text-gray-400" />
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
        :class="useCn(imageClass)"
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
  rootMargin?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imageClass: '',
  containerClass: '',
  tag: 'div',
  threshold: 0.1,
  rootMargin: '50px'
})

const containerRef = ref<HTMLElement | null>(null)
const shouldLoad = ref(false)
const isLoaded = ref(false)
const hasError = ref(false)
const showImage = ref(false)
const showError = ref(false)

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

// Set up intersection observer to trigger loading when in viewport
useIntersectionObserver(
  containerRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !shouldLoad.value) {
      shouldLoad.value = true
    }
  },
  {
    threshold: props.threshold,
    rootMargin: props.rootMargin
  }
)
</script>
