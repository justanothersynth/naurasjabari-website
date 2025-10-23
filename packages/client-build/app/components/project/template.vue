<template>
  <div class="project-template">

    <ImageLazy
      :src="currentImage.src"
      :alt="currentImage.alt"
      :image-class="`aspect-video ${isLandscape ? 'object-cover' : 'object-contain'}`"
      container-class="aspect-video mb-4 bg-gray-fill" />

    <div class="grid grid-cols-2 gap-4">

      <div>
        <p class="font-semibold">
          {{ title }}
        </p>
        <div class="image-grid flex gap-1 flex-wrap">
          <ImageLazy
            v-for="image in images"
            :key="image.src"
            :src="image.src"
            :alt="image.alt"
            :width="96"
            :height="96"
            tag="button"
            image-class="block aspect-square object-cover w-12 h-12 grayscale opacity-50 hover:opacity-100 transition-opacity duration-150 ease-in-out cursor-pointer"
            container-class="w-12 h-12"
            @mouseenter="handleImageHover(image)"
            @mouseleave="handleImageLeave" />
        </div>
      </div>

      <div>
        <p v-for="(paragraph, index) in description" :key="index">
          {{ paragraph }}
        </p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
interface ImageData {
  src: string
  alt: string
}

const props = defineProps<{
  title: string
  description: string[]
  images: ImageData[]
  defaultImage: ImageData
}>()

const currentImage = ref(props.defaultImage)
const isLandscape = ref(true)
let leaveTimeout: NodeJS.Timeout | null = null

function checkImageOrientation(imageSrc: string) {
  const img = new Image()
  img.onload = () => {
    isLandscape.value = img.width > img.height
  }
  img.src = imageSrc
}

function handleImageHover(image: ImageData) {
  // Clear any pending leave timeout
  if (leaveTimeout) {
    clearTimeout(leaveTimeout)
    leaveTimeout = null
  }
  
  currentImage.value = image
  checkImageOrientation(image.src)
}

function handleImageLeave() {
  // Debounce the reset to default image
  leaveTimeout = setTimeout(() => {
    currentImage.value = props.defaultImage
    checkImageOrientation(props.defaultImage.src)
    leaveTimeout = null
  }, 50)
}

// Check default image orientation on mount
onMounted(() => {
  checkImageOrientation(props.defaultImage.src)
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
