import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', () => {
  // ===================================================================== state
  const forceCursorPointer = ref(false)
  const contactDialogOpen = ref(false)

  // =================================================================== actions
  /**
   * Sets the force cursor pointer state
   * @param force - Whether to force the cursor to be a pointer
   */
  const setForceCursorPointer = (force: boolean) => {
    forceCursorPointer.value = force
  }

  /**
   * Sets the contact dialog open state
   * @param open - Whether to open the contact dialog
   */
  const setContactDialogOpen = (open: boolean) => {
    contactDialogOpen.value = open
  }

  // ==================================================================== return
  return {
    // ----- state
    forceCursorPointer,
    contactDialogOpen,
    // ----- actions
    setForceCursorPointer,
    setContactDialogOpen
  }
})
