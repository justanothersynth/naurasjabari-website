<template>
  <div class="project-1">

    <img :src="currentImage" alt="Yakisugi Cedar Step" :class="['aspect-video mb-4 bg-gray-fill', isLandscape ? 'object-cover' : 'object-contain']" />

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
            class="block aspect-square object-cover w-12 h-12 grayscale opacity-50 hover:opacity-100 transition-opacity duration-150 ease-in-out cursor-pointer"
            @mouseenter="handleImageHover(image)"
            @mouseleave="handleImageLeave" />
        </div>
      </div>

      <div>
        <p>A step in the style of a deck, finished with what is commonly referred to as the Yakisugi technique, involving charring of the wood with fire. Although usually attributed as a traditionally Japanese method, it has actually been used around the world for centuries.</p>
        
        <p>After charring, the top layer of the burnt Cedar was removed with a brass brush, leaving the underlying wood with a dark, rich color. Then sealed with a custom blend of tung oil, cedarwood oil and zinc oxide for water resistance, mold and mildew resistance and UV protection.</p>

        <p>With minimal effort, this can last a lifetime.</p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const defaultImage = '/images/works/yakisugi-cedar-step/DSCF0730.jpg'

const images = [
  '/images/works/yakisugi-cedar-step/DSCF0727.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0720.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0725.jpg',
  '/images/works/yakisugi-cedar-step/DSCF0724.jpg'
]

const currentImage = ref(defaultImage)
const isLandscape = ref(true)
let leaveTimeout: NodeJS.Timeout | null = null

function checkImageOrientation(imageSrc: string) {
  const img = new Image()
  img.onload = () => {
    isLandscape.value = img.width > img.height
  }
  img.src = imageSrc
}

function handleImageHover(image: string) {
  // Clear any pending leave timeout
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
  
  currentImage.value = image
  checkImageOrientation(image)
}

function handleImageLeave() {
  // Debounce the reset to default image
  leaveTimeout = setTimeout(() => {
    currentImage.value = defaultImage
    checkImageOrientation(defaultImage)
    leaveTimeout = null
  }, 50)
}

// Check default image orientation on mount
onMounted(() => {
  checkImageOrientation(defaultImage)
})
</script>

<style lang="scss" scoped>
.grid {
  @include tiny {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 8);
  }
}
</style>
