<template>
  <section class="flex gap-12">

    <div class="prose max-w-none flex-2">
      <h1 class="text-2xl flex items-center gap-2">
        Hi 👋 I'm Nauras
      </h1>
      <p class="text-lg">
        A full-stack software engineer with 10+ years of experience. My specialty lies in prototype development, complex UI implementation and systems integration inside the javascript ecosystem.
      </p>
      <p>
        Most of my time has been spent as a Lead Engineer in team-based settings, with substantial involvement in project and account management.
        I’ve handled code integrations across multiple teams worldwide, established processes and structures to keep operations running smoothly, and helped many junior engineers advance to intermediate roles.
      </p>
    </div>

    <div class="flex items-start justify-end flex-1">
      <client-only>
        <NuxtImg
          ref="imageRef"
          preload
          format="webp"
          src="/images/nauras-profile.jpg"
          alt="Profile picture of Nauras"
          class="w-80 aspect-square object-cover rounded-4xl shadow-2xl"
          :style="tiltTransform" />
      </client-only>
    </div>

  </section>
</template>

<script setup lang="ts">
import { useMouse, useElementVisibility } from '@vueuse/core'

const { x, y } = useMouse()

// Create template reference for the image
const imageRef = ref<HTMLImageElement>()

// Detect when the image is in viewport
const isImageVisible = useElementVisibility(imageRef)

// Store the last calculated transform value
const lastTransform = ref({
  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
})

/**
 * Calculate current tilt transformation based on mouse position
 */
const currentTransform = computed(() => {
  // Get viewport dimensions
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  
  // Calculate offset from center (-1 to 1)
  const offsetX = (x.value - centerX) / centerX
  const offsetY = (y.value - centerY) / centerY
  
  // Convert to rotation degrees (max 15 degrees)
  const rotateY = offsetX * 15
  const rotateX = -offsetY * 15
  
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
