<template>
  <div class="crt-monitor">
    <div class="crt-screen">

      <canvas ref="staticCanvas" class="static-canvas" />

      <div class="scanlines" />

      <div class="display-content">
        <slot />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const staticCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (!staticCanvas.value) return

  const canvas = staticCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = 300
  canvas.height = 200

  // Animate static with throttle
  let lastUpdate = 0
  const frameDelay = 50 // milliseconds between updates (adjust this to control speed)

  const animateStatic = (timestamp: number) => {
    if (timestamp - lastUpdate >= frameDelay) {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value     // red
        data[i + 1] = value // green
        data[i + 2] = value // blue
        data[i + 3] = 255   // alpha
      }
      ctx.putImageData(imageData, 0, 0)
      lastUpdate = timestamp
    }
    requestAnimationFrame(animateStatic)
  }
  requestAnimationFrame(animateStatic)
})
</script>

<style scoped>
.crt-monitor {
  position: relative;
  background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
  padding: 6px;
  border-radius: 57px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.crt-screen {
  position: relative;
  width: 300px;
  height: 200px;
  background: #000;
  border-radius: 50px;
  overflow: hidden;
  box-shadow:
    inset 0 0 20px rgba(0, 255, 0, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
}

.static-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.8;
  filter: contrast(1.2);
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}

.display-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  color: #00ff00;
  text-shadow:
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 30px #00ff00;
  font-family: 'Courier New', monospace;
  mix-blend-mode: screen;
  animation: flicker 0.15s infinite;
  z-index: 10;
}

@keyframes scanline-move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(4px);
  }
}

@keyframes flicker {
  0% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.85;
  }
}
</style>
