<template>
  <div class="w-full h-12 p-2 border border-gray-200 bg-white flex justify-between items-center z-30 rounded-2xl" aria-label="Pagination">

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
          'relative inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold ring-1 ring-inset focus-visible:outline-offset-0',
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
          'relative ml-3 inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold ring-1 ring-inset focus-visible:outline-offset-0',
          hasNext
            ? 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
            : 'bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed'
        ]"
        @click="goToNext">
        Next
      </button>
      
    </div>

  </div>
</template>

<script lang="ts" setup>
interface Props {
  currentPage: number
  pageSize: number
  totalItems?: number
  hasPrevious: boolean
  hasNext: boolean
}

interface Emits {
  (e: 'previous' | 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
