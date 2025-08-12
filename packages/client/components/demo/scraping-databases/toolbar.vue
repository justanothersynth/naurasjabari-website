<template>
  <div class="flex justify-between items-center">

    <div class="flex rounded-md bg-white outline-1 -outline-offset-1 outline-gray-200 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-blue-600">
      <input
        ref="searchInput"
        v-model="searchTerm"
        type="text"
        name="claims-search"
        placeholder="Search activity (ex: 'quiet', 'stormy')"
        class="w-80 px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
        @input="handleSearchChange" />
      <div class="flex py-1.5 pr-1.5">
        <UiKbd theme="light" variant="square">
          ⌘K
        </UiKbd>
      </div>
    </div>

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
  searchTerm?: string
  filter: SupabaseFilter
}>()

const emit = defineEmits<{
  'search-change': [searchTerm: string]
  'filter-change': [payload: { filterId: string, filterValue: string }]
}>()

const searchTerm = ref(props.searchTerm || '')
const searchInput = ref<HTMLInputElement>()
const keys = useMagicKeys()
const cmdK = keys['Meta+k']

// Watch for Cmd+K and focus the search input
watch(cmdK, (pressed) => {
  if (pressed && searchInput.value) {
    searchInput.value.focus()
  }
})

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

const handleSearchChange = useDebounceFn(() => {
  emit('search-change', searchTerm.value)
}, 300)
</script>
