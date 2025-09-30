<template>
  <section class="flex gap-12">

    <div class="prose max-w-none flex-2">
      <h1 class="text-2xl font-semibold flex items-center gap-2">
        Hi 👋 I'm Nauras
      </h1>
      <p class="text-lg font-medium">
        Carpenter at heart. General contractor everywhere else. I really enjoy the process of designing and building things that are useful and that will bring joy to those that use them.
      </p>
      <p>
        Whether it's a coffee table, a pergola, a new stone walkway or a complete bathroom rebuild, I'm here to make it happen. Carpentry is my first true love, but I've always enjoyed being multi-faceted in my knowledge and abilities. I'm currently building up my portfolio and working on increasing my skillset, so I am offering my services at a significant discount. Regardless, your project will be completed with care and attention to detail.
      </p>
    </div>

    <div class="flex items-start justify-end flex-1">
      <client-only>
        <img
          ref="imageRef"
          src="/images/nauras-profile.jpg"
          alt="Profile picture of Nauras"
          class="w-80 aspect-square object-cover rounded-md shadow-2xl"
          :style="tiltTransform">
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
  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
  transition: 'transform 0.1s ease-out'
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
  const rotateY = offsetX * 10
  const rotateX = -offsetY * 10
  
  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    transition: 'transform 0.1s ease-out'
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
