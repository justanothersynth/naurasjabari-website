<template>
  <div class="flex justify-center items-center gap-2 mb-4 mt-6">

    <span class="text-sm text-gray-600">Calmer</span>

    <div class="flex items-center gap-2 text-sm text-gray-600">
      <div class="flex gap-1">
        <div
          v-for="color in activityColors"
          :key="color"
          :class="['w-3 h-3 rounded-full', color]" />
      </div>
    </div>

    <span class="text-sm text-gray-600">Stormier</span>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  activityColors: string[]
}>()
</script>
