<template>
  <div class="flex flex-wrap gap-1">
    <span
      v-for="activity in filteredActivities"
      :key="activity"
      :class="getActivityColor(activity)"
      class="inline-block px-1 py-0.5 rounded text-xs font-medium">
      {{ activity }}
    </span>
  </div>
</template>

<script setup lang="ts">
type Props = {
  activities: string[]
}

const props = defineProps<Props>()

/**
 * Gets a color class based on the storm activity level
 * @param activity - The activity level string
 * @returns CSS class for styling
 */
const getActivityColor = (activity: string): string => {
  const normalizedActivity = activity.toLowerCase().trim()
  
  if (normalizedActivity.includes('quiet')) return 'bg-green-100 text-green-800 border-green-200'
  if (normalizedActivity.includes('unsettled')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (normalizedActivity.includes('active')) return 'bg-orange-100 text-orange-800 border-orange-200'
  if (normalizedActivity.includes('stormy')) return 'bg-red-100 text-red-800 border-red-200'
  
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

/**
 * Filters out empty activities
 * @param activities - Array of activity strings
 * @returns Array of non-empty activities
 */
const filteredActivities = computed(() => {
  return props.activities.filter(activity => activity.trim())
})
</script>
