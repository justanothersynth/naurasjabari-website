<template>
  <div
    class="matrix-effect"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    
    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        class="matrix-canvas cover" />
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * Thank you Clive Cooper for creating this awesome matrix effect
 *
 * {@link https://codepen.io/yaclive/pen/EayLYO | Matrix Effect}
 */

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rect = ref<DOMRect | null>(null)
const rectWidth = ref(0)
let ctx: CanvasRenderingContext2D | null = null
const fontSize = 8
let columns = 0
const letters = 'ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ'
const lettersArray = letters.split('')
const drops: number[] = []
let dropCount = drops.length
let intervalId: NodeJS.Timeout

const fills = {
  background: 'rgba(221, 221, 221, 0.1)',
  text: '#000000'
}

let speed = 30

const handleMouseEnter = () => {
  fills.background = 'rgba(0, 0, 0, 0.1)'
  fills.text = '#0f0'
  speed = 15
  clearInterval(intervalId)
  intervalId = setInterval(draw, speed)
}

const handleMouseLeave = () => {
  fills.background = 'rgba(221, 221, 221, 0.1)'
  fills.text = '#000000'
  speed = 30
  clearInterval(intervalId)
  intervalId = setInterval(draw, speed)
}

onMounted(() => {
  if (!canvasRef.value) return
  
  // Initialize context
  ctx = canvasRef.value.getContext('2d')

  // Get device pixel ratio and set correct canvas dimensions
  const dpr = window.devicePixelRatio || 1
  rect.value = canvasRef.value.getBoundingClientRect()
  rectWidth.value = rect.value?.width
  columns = rectWidth.value / fontSize
  
  // Set the canvas size accounting for device pixel ratio
  canvasRef.value.width = rectWidth.value * dpr
  canvasRef.value.height = rect.value.height * dpr
  
  // Scale the context to ensure correct drawing
  if (ctx) {
    ctx.scale(dpr, dpr)
    ctx.font = `${fontSize}px monospace`
  }

  for (let i = 0; i < columns; i++) {
    drops[i] = 1
  }
  dropCount = drops.length

  intervalId = setInterval(draw, speed)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

function draw() {
  if (!ctx || !canvasRef.value) return
  
  ctx.fillStyle = fills.background
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  for (let i = 0; i < dropCount; i++) {
    const text = lettersArray[Math.floor(Math.random() * lettersArray.length)]
    const drop = drops[i]
    if (!text || drop === undefined) continue
    
    ctx.fillStyle = fills.text
    ctx.fillText(text, i * fontSize, drop * fontSize)
    drops[i]!++
    
    if (drops[i]! * fontSize > canvasRef.value.height && Math.random() > .95) {
      drops[i] = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.matrix-effect {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
