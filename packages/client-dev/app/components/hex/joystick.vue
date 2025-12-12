<template>
  <div
    ref="joystickRef"
    class="absolute bottom-6 right-6 z-100 touch-none"
    @touchstart.prevent="handleJoystickStart"
    @touchmove.prevent="handleJoystickMove"
    @touchend.prevent="handleJoystickEnd"
    @touchcancel.prevent="handleJoystickEnd">
    <div class="joystick-base size-[120px] rounded-full border-2 border-white/20 backdrop-blur-md flex items-center justify-center">
      <div
        class="joystick-knob size-12 rounded-full border-2 border-white/40 transition-transform duration-50 ease-out cursor-grab active:cursor-grabbing"
        :style="{
          transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`
        }" />
    </div>
  </div>
</template>

<script setup lang="ts">
const hexStore = useHexagonStore()
const { joystickData } = storeToRefs(hexStore)

const { canvasWidth, canvasHeight, contentBounds, revealPadding } = joystickData.value

// Joystick state
const joystickRef = ref<HTMLElement | null>(null)
const joystickPosition = ref({ x: 0, y: 0 })
const isJoystickActive = ref(false)
const joystickBaseRadius = 60
const joystickKnobRadius = 24

/**
 * Computes canvas translation based on joystick position
 */
const computeJoystickTranslation = () => {
  if (!isJoystickActive.value) return

  // Normalize joystick position to -1 to 1 range
  const maxDistance = joystickBaseRadius - joystickKnobRadius
  const normalizedX = joystickPosition.value.x / maxDistance
  const normalizedY = joystickPosition.value.y / maxDistance

  const canvasHalfWidth = canvasWidth / 2
  const canvasHalfHeight = canvasHeight / 2

  // Calculate overflow for each direction independently
  const overflowRight = Math.max(0, contentBounds.maxX - canvasHalfWidth) + revealPadding
  const overflowLeft = Math.max(0, -contentBounds.minX - canvasHalfWidth) + revealPadding
  const overflowBottom = Math.max(0, contentBounds.maxY - canvasHalfHeight) + revealPadding
  const overflowTop = Math.max(0, -contentBounds.minY - canvasHalfHeight) + joystickData.value.revealPadding

  // Calculate translation based on joystick direction
  let translationX = 0
  if (normalizedX >= 0) {
    translationX = -normalizedX * overflowRight
  } else {
    translationX = -normalizedX * overflowLeft
  }

  let translationY = 0
  if (normalizedY >= 0) {
    translationY = -normalizedY * overflowBottom
  } else {
    translationY = -normalizedY * overflowTop
  }

  hexStore.setHexCanvasTranslation({
    x: translationX,
    y: translationY
  })
}

/**
 * Handles joystick touch start
 */
const handleJoystickStart = (event: TouchEvent) => {
  isJoystickActive.value = true
  updateJoystickPosition(event)
}

/**
 * Handles joystick touch move
 */
const handleJoystickMove = (event: TouchEvent) => {
  if (!isJoystickActive.value) return
  updateJoystickPosition(event)
}

/**
 * Handles joystick touch end - keeps position, only marks as inactive
 */
const handleJoystickEnd = () => {
  isJoystickActive.value = false
}

/**
 * Resets joystick to center position and clears canvas translation
 */
const resetJoystick = () => {
  joystickPosition.value = { x: 0, y: 0 }
  hexStore.setHexCanvasTranslation({ x: 0, y: 0 })
}

/**
 * Updates joystick knob position based on touch event
 */
const updateJoystickPosition = (event: TouchEvent) => {
  if (!joystickRef.value) return

  const touch = event.touches[0]
  if (!touch) return
  const rect = joystickRef.value.getBoundingClientRect()

  // Calculate touch position relative to joystick center
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  let deltaX = touch.clientX - centerX
  let deltaY = touch.clientY - centerY

  // Constrain to max radius
  const maxDistance = joystickBaseRadius - joystickKnobRadius
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  if (distance > maxDistance) {
    const angle = Math.atan2(deltaY, deltaX)
    deltaX = Math.cos(angle) * maxDistance
    deltaY = Math.sin(angle) * maxDistance
  }

  joystickPosition.value = { x: deltaX, y: deltaY }
  computeJoystickTranslation()
}

// Reset joystick when scrolling out of viewport
watch(() => joystickData.value.display, (visible) => {
  if (!visible) {
    resetJoystick()
  }
})
</script>

<style scoped>
.joystick-base {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.joystick-knob {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
</style>
