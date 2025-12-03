<template>
  <div
    ref="navRef"
    class="floating-nav fixed bottom-4 left-1/2 -translate-x-1/2 z-1000 bg-prime/80 backdrop-blur-lg border border-gray-200 p-2 rounded-full gap-1 shadow-xl flex items-center"
    :class="{ 'is-visible': isVisible }"
    :style="{ '--mouse-x': `${elementX}px`, '--mouse-y': `${elementY}px` }">

    <button
      :class="buttonClasses"
      aria-label="Contact Me"
      @click="openContactDialog">
      <Icon name="iconoir:mail" size="16" class="mt-0.5" />
      <span>contact me</span>
    </button>

    <a
      href="https://github.com/timelytree"
      target="_blank"
      rel="noopener noreferrer"
      :class="buttonClasses"
      aria-label="View GitHub Profile">
      <Icon name="iconoir:github" size="14" />
      <span>github</span>
      <Icon name="iconoir:arrow-up-right-square" size="14" class="text-gray-400 ml-[-2px]"/>
    </a>

  </div>
</template>

<script lang="ts" setup>
import { useMouseInElement } from '@vueuse/core'

const buttonClasses = 'flex items-center gap-1 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded-full px-2 py-1 text-sm'

const navRef = ref<HTMLElement | null>(null)
const { elementX, elementY } = useMouseInElement(navRef)
const loaded = ref(false)

const generalStore = useGeneralStore()
const { contactDialogOpen } = storeToRefs(generalStore)

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      loaded.value = true
    }, 500)
  })
})

const isVisible = computed(() => {
  return loaded.value && !contactDialogOpen.value
})

const openContactDialog = () => {
  generalStore.setContactDialogOpen(true)
}
</script>

<style lang="scss" scoped>
.floating-nav {
  overflow: hidden;
  transform: translateY(calc(100% + 2rem));
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  &:hover {
    &:before {
      opacity: 1;
    }
  }
  &.is-visible {
    transform: translateY(0);
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
</style>
