<template>
  <div class="w-full flex flex-col gap-1">
    <div
      v-for="n in count"
      :key="n"
      class="bg-white p-4 flex gap-2 space-x-4">
      
      <div class="flex-1 flex flex-col min-w-0 gap-2">
        <SkeletonRow tw-mods="w-100 h-5" />
        <SkeletonRow tw-mods="w-60 h-3" />
      </div>

      <div class="flex items-start">
        <SkeletonRow tw-mods="w-20 h-6 rounded-full" />
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
