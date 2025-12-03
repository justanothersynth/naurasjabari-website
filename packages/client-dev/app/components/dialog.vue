<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-10" @close="onClose()">
      
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200 delay-[200ms]"
        leave-from="opacity-100"
        leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-100/10 backdrop-blur-lg transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto flex min-h-full flex-col items-center justify-center p-4 sm:p-0">
        <TransitionChild
          as="template"
          enter="transition-all ease-out duration-100 delay-[100ms]"
          enter-from="opacity-0 -translate-y-4"
          enter-to="opacity-100 translate-y-0"
          leave="transition-all ease-in duration-200"
          leave-from="opacity-100 translate-y-0"
          leave-to="opacity-0 translate-y-2">
          <div class="prose">
            <h3>Contact Me</h3>
            <p>I'm always happy to discuss a project idea or provide a quote.</p>
          </div>
        </TransitionChild>
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <DialogPanel :class="panelClass">
            <slot />
          </DialogPanel>
        </TransitionChild>
      </div>
      
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  onClose: {
    type: Function,
    required: true
  },
  panelClass: {
    type: String,
    default: 'relative transform overflow-hidden rounded-4xl bg-white px-4 pt-5 pb-4 text-left shadow-xl border border-gray-200 transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'
  }
})
</script>
