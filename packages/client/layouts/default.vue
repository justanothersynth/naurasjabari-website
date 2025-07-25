<template>
  <TooltipProvider>
    <div class="layout w-screen h-screen">

      <slot />

    </div>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'
</script>
