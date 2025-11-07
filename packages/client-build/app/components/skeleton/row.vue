<template>
  <div :class="cn('bg-gray-200 rounded-md animate-pulse h-5 w-3/4', twMods)" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  twMods?: string
}>(), {
  twMods: ''
})

const cn = useCn
</script>
