<template>
  <div class="flex flex-col items-center justify-center h-screen">

    <h1 class="text-4xl font-bold">
      {{ error.statusCode }}
    </h1>

    <div class="text-lg">
      {{ error.message }}
    </div>

    <UiButton
      variant="bare"
      class="rounded-md flex items-center gap-1.5 bg-white px-3 py-2 mt-4 text-xs font-semibold ring-1 ring-gray-300 ring-inset hover:bg-gray-50 transition-colors"
      @click="navigateTo('/')">
      <Icon name="iconoir:arrow-left" size="12" class="mr-1" />
      Back to home
    </UiButton>

  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '@workspace/types'

defineProps<{
  error: NuxtError
}>()
</script>
