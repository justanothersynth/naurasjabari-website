<template>
  <div
    class="floating-nav-wrapper fixed bottom-4 left-1/2 -translate-x-1/2 z-1000 flex flex-col items-center gap-3"
    :class="{ 'is-visible': isVisible }">

    <!-- Joystick hint -->
    <JoystickHint />

    <div class="flex items-center">
      <div
        ref="navRef"
        class="floating-nav bg-prime/80 backdrop-blur-lg border border-gray-200 p-3 rounded-full gap-1 shadow-xl flex items-center"
        :style="{ '--mouse-x': `${mouseX}px`, '--mouse-y': `${mouseY}px` }">

      <a
        :class="buttonClasses"
        href="mailto:nauras@moogmedia.ca"
        aria-label="Contact Me">
        <Icon name="iconoir:mail" size="16" class="mt-0.5" />
        <span class="whitespace-nowrap">get in touch</span>
      </a>

      <a
        href="https://github.com/justanothersynth"
        target="_blank"
        rel="noopener noreferrer"
        :class="buttonClasses"
        aria-label="View GitHub Profile">
        <Icon name="iconoir:github" size="14" />
        <span class="whitespace-nowrap">github</span>
        <Icon name="iconoir:arrow-up-right-square" size="14" class="text-gray-400 ml-[-2px]"/>
      </a>

      </div>

      <!-- Joystick control -->
      <div
        class="joystick-wrapper ml-3"
        :class="{ 'is-active': joystickData.display }">
        <HexJoystick v-if="joystickData.display" />
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { useMouseInElement } from '@vueuse/core'

const buttonClasses = 'flex items-center gap-1 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded-full py-1 px-2 text-[14px]'

const navRef = ref<HTMLElement | null>(null)
const { elementX, elementY, isOutside } = useMouseInElement(navRef)

const mouseX = ref(0)
const mouseY = ref(0)
const loaded = ref(false)

const hexStore = useHexagonStore()
const { joystickData } = storeToRefs(hexStore)

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      loaded.value = true
    }, 500)
  })
})

const isVisible = computed(() => {
  return loaded.value
})

watch([elementX, elementY, isOutside], ([x, y, outside]) => {
  if (!outside) {
    mouseX.value = x
    mouseY.value = y
  }
})
</script>

<style lang="scss" scoped>
.floating-nav-wrapper {
  transform: translateY(calc(100% + 2rem));
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);

  &.is-visible {
    transform: translateY(0);
  }
}

.floating-nav {
  overflow: hidden;
  position: relative;

  &:hover {
    &:before {
      opacity: 1;
    }
  }

  > * {
    position: relative;
    z-index: 2;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    background: radial-gradient(
      circle 50px at var(--mouse-x, 0px) var(--mouse-y, 0px),
      rgba(255, 255, 255, 1),
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }
}

.joystick-wrapper {
  width: 0;
  transition: width 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease;
  opacity: 0;
  &.is-active {
    width: 50px;
    opacity: 1;
  }
}
</style>
