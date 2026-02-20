<template>
  <Error404 v-if="error.statusCode === 404" :error="error" />
  <pre v-else><code>{{ error }}</code></pre>
</template>

<script lang="ts" setup>
import type { NuxtError } from '@workspace/types'

defineProps<{
  error: NuxtError
}>()
</script>
