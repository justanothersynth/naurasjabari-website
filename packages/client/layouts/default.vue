<template>
  <TooltipProvider>
    <div :class="['layout overflow-x-hidden', { 'force-cursor-pointer': forceCursorPointer }]">

      <slot />

    </div>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'

const generalStore = useGeneralStore()
const { forceCursorPointer } = storeToRefs(generalStore)
</script>

<style lang="scss" scoped>
.layout {
  &.force-cursor-pointer {
    cursor: pointer;
  }
}
</style>
