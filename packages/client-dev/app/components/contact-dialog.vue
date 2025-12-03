<template>
  <Dialog
    :is-open="contactDialogOpen"
    :on-close="closeDialog"
    class="z-100">

    <ContactForm />

  </Dialog>
</template>

<script setup>
const generalStore = useGeneralStore()
const { contactDialogOpen } = storeToRefs(generalStore)

const closeDialog = () => {
  generalStore.setContactDialogOpen(false)
}
</script>
