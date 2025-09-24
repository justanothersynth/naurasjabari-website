<template>
  <div class="grid grid-cols-4 gap-4">
    <div v-for="image in images" :key="image">
      <img :src="image" :alt="image" class="w-full aspect-square object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
const images = [
  '/images/builder-maker/geodesic-dome.jpg',
  '/images/builder-maker/lamp.jpg',
  '/images/builder-maker/benches-1.jpg',
  '/images/builder-maker/benches-2.jpg',
  '/images/builder-maker/candle-holder-1.jpg',
  '/images/builder-maker/candle-holder-2.jpg',
  '/images/builder-maker/compost-1.jpg',
  '/images/builder-maker/compost-2.jpg',
  '/images/builder-maker/interlock.jpg',
  '/images/builder-maker/sheds-1.jpg',
  '/images/builder-maker/sheds-2.jpg'
]
</script>
