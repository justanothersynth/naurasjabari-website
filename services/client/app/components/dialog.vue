<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-10" @close="onClose()">
      
      <TransitionChild
        as="template"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200 delay-[200ms]"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-100/50 backdrop-blur-lg transition-opacity" />
      </TransitionChild>

      <slot />
      
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, TransitionChild, TransitionRoot } from '@headlessui/vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  }
})
</script>
