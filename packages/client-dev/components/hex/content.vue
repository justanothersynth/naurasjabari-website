<template>
  <div class="hex-content">

    <div
      ref="contentRef"
      :style="{ paddingTop: `${offset}px` }"
      :class="['content', { visible: contentVisible }]">
      <div class="inner-content">
        <div class="grid container mx-auto px-4 max-w-content">
          <slot />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const { $bus } = useNuxtApp()

const store = useHexagonStore()
const { selectedHexagon } = storeToRefs(store)

const offset = ref(0)
const contentVisible = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const route = useRoute()

const handleHexCanvasShiftComplete = () => {
  if (route.meta.singularPage) {
    offset.value = selectedHexagon.value?.ref?.getBoundingClientRect().bottom ?? 0
    contentVisible.value = route.path !== '/'
  } else {
    contentVisible.value = false
  }
}

$bus.$on('hex-canvas-shift-complete', handleHexCanvasShiftComplete)

onBeforeUnmount(() => {
  $bus.$off('hex-canvas-shift-complete', handleHexCanvasShiftComplete)
})
</script>

<style lang="scss" scoped>
.content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10000;
  &.visible {
    pointer-events: all;
  }
}
</style>
