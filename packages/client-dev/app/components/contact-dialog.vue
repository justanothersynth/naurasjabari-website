<template>
  <Dialog
    :is-open="contactDialogOpen"
    :on-close="closeDialog"
    class="z-100">

    <div class="fixed inset-0 z-10 w-screen h-screen flex flex-col justify-end p-8">

      <TransitionChild
        class="prose"
        enter="transition-all ease-out duration-150"
        enter-from="opacity-0 -translate-y-4"
        enter-to="opacity-100 translate-y-0"
        leave="transition-all ease-in duration-300"
        leave-from="opacity-100 translate-y-0"
        leave-to="opacity-0 translate-y-6">
        <h3>Contact Me</h3>
        <p>I'm always happy to discuss a project idea or provide a quote.</p>
      </TransitionChild>

      <TransitionChild
        as="template"
        enter="transition-all ease-out duration-200"
        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to="opacity-100 translate-y-0 sm:scale-100"
        leave="transition-all ease-in duration-300 delay-[50ms]"
        leave-from="opacity-100 translate-y-0"
        leave-to="opacity-0 translate-y-12">
        <DialogPanel :class="panelClass">
          <ContactForm />
        </DialogPanel>
      </TransitionChild>

    </div>

  </Dialog>
</template>

<script setup>
import { DialogPanel, TransitionChild } from '@headlessui/vue'

const generalStore = useGeneralStore()
const { contactDialogOpen } = storeToRefs(generalStore)

const panelClass = 'relative transform overflow-hidden text-left sm:mt-8 sm:w-lg'

const closeDialog = () => {
  generalStore.setContactDialogOpen(false)
}
</script>
