<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2">
    <div
      v-if="isVisible"
      class="relative bg-[#302c2c] border border-gray-200 text-white rounded-full shadow-xl flex items-center gap-2 px-4 py-2 mb-2">
      
      <span class="whitespace-nowrap">This is a joystick, try moving it</span>
      
      <Icon name="iconoir:long-arrow-right-down" size="24" />
      
    </div>
  </Transition>
</template>

<script setup lang="ts">
const hexStore = useHexagonStore()
const { joystickData } = storeToRefs(hexStore)

const isVisible = computed(() =>
  joystickData.value.display && joystickData.value.hintVisible
)

onMounted(() => {
  // Initialize joystick hint dismissed state from localStorage
  hexStore.initJoystickHintDismissed()
})
</script>
