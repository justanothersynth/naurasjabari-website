<template>
  <div class="w-6xl h-14 p-2 fixed bottom-4 left-1/2 -translate-x-1/2 border border-gray-200 bg-white flex justify-between items-center z-30 rounded-lg" aria-label="Pagination">

    <!-- Items count -->
    <div v-if="totalItems !== undefined && totalItems > 0" class="hidden sm:block text-sm text-gray-700">
      Showing
      {{ ' ' }}
      <span class="font-medium">{{ startItem }}</span>
      {{ ' ' }}
      -
      {{ ' ' }}
      <span class="font-medium">{{ endItem }}</span>
      {{ ' ' }}
      of
      {{ ' ' }}
      <span class="font-medium">{{ totalItems || 'many' }}</span>
      {{ ' ' }}
      results
    </div>

    <div v-else class="sm:block text-sm text-gray-700 font-medium">
      No results found
    </div>

    <!-- Custom content to go in the middle -->
    <slot />

    <!-- Pagination buttons -->
    <div class="flex justify-between sm:justify-end">
      
      <button
        :disabled="!hasPrevious"
        :class="[
          'relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset focus-visible:outline-offset-0',
          hasPrevious
            ? 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed'
        ]"
        @click="goToPrevious">
        Previous
      </button>
      
      <button
        :disabled="!hasNext"
        :class="[
          'relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset focus-visible:outline-offset-0',
          hasNext
            ? 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed'
        ]"
        @click="goToNext">
        Next
      </button>
      
    </div>

    <!-- Shadow backdrop -->
    <div
      class="absolute top-0 left-0 w-full h-full shadow-md rounded-lg transition-opacity duration-300 ease-in-out z-[-1]"
      :style="{ opacity: shadowOpacity }" />

  </div>
</template>

<script lang="ts" setup>
import { useScroll } from '@vueuse/core'

const props = defineProps<{
  currentPage: number
  pageSize: number
  totalItems?: number
  hasPrevious: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  (e: 'previous' | 'next'): void
}>()

const { y: scrollY } = useScroll(window)

// Hide shadow when at bottom, show when scrolled up
const shadowOpacity = computed(() => {
  if (import.meta.server) return 0
  const scrollTop = scrollY.value
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  // Check if we're at the bottom (with a small threshold for precision)
  const isAtBottom = scrollTop + windowHeight >= documentHeight - 10
  return isAtBottom ? 0 : 1
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems || props.currentPage * props.pageSize)
})

const goToPrevious = () => {
  if (props.hasPrevious) {
    emit('previous')
  }
}

const goToNext = () => {
  if (props.hasNext) {
    emit('next')
  }
}
</script>
