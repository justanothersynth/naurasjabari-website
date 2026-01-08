<template>
  <div class="flex flex-col items-center justify-center h-screen">

    <CrtMonitor>
      {{ error.statusCode }}
    </CrtMonitor>

    <div class="text-lg mt-8">
      {{ error.message }}
    </div>

    <UiButton
      variant="bare"
      class="mt-4"
      @click="handleGoHome">
      <Icon name="iconoir:arrow-left" size="12" class="mr-2" />
      Back to home
    </UiButton>

  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '@workspace/types'

defineProps<{
  error: NuxtError
}>()

const handleGoHome = () => navigateTo('/')
</script>
