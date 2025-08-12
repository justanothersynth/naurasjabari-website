<template>
  <div class="flex justify-between items-center">

    <div class="flex items-center gap-2 text-sm">
      <button
        v-for="label in labels"
        :key="label"
        :class="[
          'rounded-md px-2.5 py-1 text-sm font-semibold transition-colors',
          label === filter.filterValue
            ? 'bg-gray-100 text-gray-900 ring-gray-300 cursor-default'
            : 'text-gray-700 ring-gray-200 hover:bg-gray-100 hover:text-gray-900'
        ]"
        @click="selectFilter(filter.id, label)">
        {{ label }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { SupabaseFilter } from '@workspace/types'

const props = defineProps<{
  filter: SupabaseFilter
}>()

const emit = defineEmits<{
  'filter-change': [payload: { filterId: string, filterValue: string }]
}>()

const labels = [
  'all',
  'quiet',
  'unsettled',
  'active',
  'stormy',
  'major storm'
]

const selectFilter = (filterId: string, filterValue: string) => {
  if (filterValue === props.filter.filterValue) return
  emit('filter-change', { filterId, filterValue })
}
</script>
