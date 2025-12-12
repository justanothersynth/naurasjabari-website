<template>
  <section class="mt-20 relative z-1">
    
    <div class="max-w-4xl mx-auto relative z-30">
      <div class="prose max-w-[67ch]">
        <h2>Complex UI</h2>
        <p>
          Building truly complex UIs is difficult and time-consuming, but it can be very rewarding —
          both for the sense of personal accomplishment and for the eye-candy factor.
          Sometimes, it's nice to just stare at or interact with something interesting!
        </p>
      </div>
    </div>

    <div ref="containerRef" class="max-w-2xl mx-auto aspect-square relative mt-10">

      <div class="absolute inset-0 rounded-full z-20">

        <!-- Top layer: fully visible -->
        <HexCanvas class="border border-gray-200 bg-white rounded-full overflow-hidden z-20">

          <HexNode
            name="where-am-i"
            attached-to="origin"
            :radius="300">
            <DemoComplexUiLocation />
          </HexNode>

          <HexNode
            name="widgets"
            attached-to="where-am-i"
            :angle="-110">
            <DemoComplexUiWidgets />
          </HexNode>

        </HexCanvas>

        <!-- Radial fade overlay: transparent center, fades to background color beyond container edge -->
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vh] pointer-events-none z-10"
          :style="{ background: fadeGradient }" />

        <!-- Bottom layer: blueprint visible -->
        <div class="absolute inset-0 w-full h-full pointer-events-none z-5">
          <HexCanvas show-outline>

            <HexNode
              name="where-am-i"
              attached-to="origin"
              :radius="300">
              <DemoComplexUiLocation />
            </HexNode>

            <HexNode
              name="widgets"
              attached-to="where-am-i"
              :angle="-110">
              <DemoComplexUiWidgets />
            </HexNode>

          </HexCanvas>
        </div>

      </div>
      
    </div>

  </section>
</template>

<script setup lang="ts">
const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)
const isSmallScreen = useMediaQuery('(max-width: 639px)')

const fadeBuffer = 180

const fadeGradient = computed(() => {
  const divisor = isSmallScreen.value ? 3 : 2
  const radius = width.value / divisor
  const fadeEnd = radius + fadeBuffer
  return `radial-gradient(circle, transparent ${radius}px, var(--color-root) ${fadeEnd}px)`
})
</script>
