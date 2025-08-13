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
        Most of my time has been spent in the role of Lead Engineer in team-based settings, with plenty of project and account management in between.
        I've done code integrations across multiple teams (across continents), I've set up processes and structures to keep things running smoothly and I've moved my fair share of juniors into intermediate positions.
      </p>
    </div>

    <div class="flex items-start justify-end flex-1">
      <client-only>
        <img
          src="/images/nauras-profile.jpg"
          alt="Profile picture of Nauras"
          class="w-80 aspect-square object-cover rounded-4xl shadow-2xl"
          :style="tiltTransform">
      </client-only>
    </div>

  </section>
</template>

<script setup lang="ts">
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()

/**
 * Calculate tilt transformation based on mouse position
 * Creates a subtle 3D perspective effect on the profile picture
 */
const tiltTransform = computed(() => {
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
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    transition: 'transform 0.1s ease-out'
  }
})
</script>
