<template>
  <div class="project-1">

    <img src="/images/works/yakisugi-cedar-step/DSCF0730.jpg" alt="Yakisugi Cedar Step" class="aspect-video object-cover mb-4" />

    <div class="grid grid-cols-2 gap-4">

      <div>
        <p class="font-semibold">
          Yakisugi Cedar Step
        </p>
        <div class="image-grid flex gap-1 flex-wrap">
          <img
            v-for="image in images"
            :key="image"
            :src="image"
            :alt="image"
            class="block aspect-square object-cover w-12 h-12 grayscale opacity-50 hover:opacity-100 transition-opacity duration-150 ease-in-out" />
        </div>
      </div>

      <div>
        <p>A step in the style of a deck, finished with what is commonly referred to as the Yakisugi technique, involving charring of the wood with fire. Although usually attributed as a traditionally Japanese method, it has actually been used around the world for centuries.</p>
        
        <p>After charring, the top layer of the burnt Cedar was removed with a brass brush, leaving the underlying wood with a dark, rich color. Then sealed with a custom blend of tung oil, cedarwood oil and zinc oxide for water resistance, mold and mildew resistance and UV protection, respectively.</p>

        <p>With minimal effort, this can last a lifetime.</p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const images = [
  '/images/works/yakisugi-cedar-step/DSCF0720.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0724.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0725.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0727.jpg'
]
</script>
