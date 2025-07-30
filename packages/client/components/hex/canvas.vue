<template>
  <div
    ref="hexCanvasRef"
    class="hex-canvas w-screen h-screen relative"
    @mousemove="throttledMouseMove"
    @mouseleave="store.setIsHoveringCanvas(false)">
    <div
      ref="hexCanvasInnerRef"
      :style="{ transform: `translate(${hexCanvasTranslation.x}px, ${hexCanvasTranslation.y}px)` }"
      class="hex-canvas-inner absolute inset-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HexNode } from '@/types/hexagon'

const { $bus } = useNuxtApp()

const store = useHexagonStore()
const { hexCanvasTranslation } = storeToRefs(store)
const hexCanvasRef = ref<HTMLElement | null>(null)
const hexCanvasInnerRef = ref<HTMLElement | null>(null)

provide('hexCanvasRef', hexCanvasRef)

const throttledMouseMove = useThrottleFn(() => {
  if (store.isHoveringCanvas) return
  store.setIsHoveringCanvas(true)
}, 100)

const handleTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName === 'transform') {
    $bus.$emit('hex-canvas-shift-complete')
  }
}

$bus.$on('hex-reset', () => {
  hexCanvasTranslation.value = { x: 0, y: 0 }
})

$bus.$on('hex-node-triggered', (event: unknown) => {
  const { name } = event as HexNode
  const hexNode = store.getHexNode(name)

  if (!hexCanvasRef.value || !hexNode?.ref) return

  // Get canvas position and dimensions
  const canvasBox = hexCanvasRef.value.getBoundingClientRect()
  const canvasTop = canvasBox.top + window.scrollY
  const canvasLeft = canvasBox.left + window.scrollX
  
  // Get the selected hex node's center point relative to canvas
  const hexNodeBox = hexNode.ref.getBoundingClientRect()
  const hexNodeY = (hexNodeBox.top + window.scrollY) - canvasTop + (hexNodeBox.height / 2)
  const hexNodeX = (hexNodeBox.left + window.scrollX) - canvasLeft + (hexNodeBox.width / 2)
  
  // Account for current canvas translation to get the original position within canvas
  const currentTranslation = hexCanvasTranslation.value
  const originalHexNodeY = hexNodeY - currentTranslation.y
  const originalHexNodeX = hexNodeX - currentTranslation.x
  
  // Get the canvas center point to center the hex node within the canvas
  const canvasCenterX = canvasBox.width / 2
  const canvasCenterY = canvasBox.height / 2
  
  // Calculate the offset to center the hex node within the canvas
  const offsetY = originalHexNodeY - canvasCenterY
  const offsetX = originalHexNodeX - canvasCenterX
  
  // Set the hex canvas translation to center the hex node
  store.setHexCanvasTranslation({
    x: -offsetX,
    y: -offsetY
  })
})

onMounted(() => {
  hexCanvasInnerRef.value?.addEventListener('transitionend', handleTransitionEnd)
})

onBeforeUnmount(() => {
  hexCanvasInnerRef.value?.removeEventListener('transitionend', handleTransitionEnd)
})
</script>

<style lang="scss" scoped>
.hex-canvas-inner {
  transition: transform 500ms ease-in-out;
}
</style>
