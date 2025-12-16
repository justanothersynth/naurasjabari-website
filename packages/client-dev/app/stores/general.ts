import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', () => {
  // ===================================================================== state
  const forceCursorPointer = ref(false)
  const contactDialogOpen = ref(false)
  const isTouchDevice = ref(false)

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

  /**
   * Sets whether the device supports touch input
   * @param isTouch - Whether the device supports touch input
   */
  const setIsTouchDevice = (isTouch: boolean) => {
    isTouchDevice.value = isTouch
  }

  // ==================================================================== return
  return {
    // ----- state
    forceCursorPointer,
    contactDialogOpen,
    isTouchDevice,
    // ----- actions
    setForceCursorPointer,
    setContactDialogOpen,
    setIsTouchDevice
  }
})
