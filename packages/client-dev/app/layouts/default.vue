<template>
  <TooltipProvider>
    <div :class="['layout overflow-x-hidden', { 'force-cursor-pointer': forceCursorPointer }]">

      <slot />

      <!-- Floating Navigation -->
      <FloatingNav />

      <!-- Global mouse-following tooltip -->
      <GlobalTooltip />

    </div>
  </TooltipProvider>
</template>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'

if (import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  useHead({
    meta: [
      { name: 'msapplication-config', content: '/favicon/light/browserconfig.xml' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon/light/favicon-96x96.png' },
      { rel: 'manifest', href: '/favicon/light/manifest.json' }
    ]
  })
}

const generalStore = useGeneralStore()
const { forceCursorPointer } = storeToRefs(generalStore)

onMounted(() => {
  // Detect if device has touch support
  generalStore.setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
})
</script>

<style lang="scss" scoped>
.layout {
  &.force-cursor-pointer {
    cursor: pointer;
  }
}
</style>
