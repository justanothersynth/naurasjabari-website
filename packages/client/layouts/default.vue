<template>
  <TooltipProvider>
    <div class="layout max-w-4xl mx-auto">

      <slot />

    </div>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'
</script>
