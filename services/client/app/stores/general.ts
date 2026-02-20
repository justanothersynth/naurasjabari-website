import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', () => {
  // ===================================================================== state
  const forceCursorPointer = ref(false)
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
    isTouchDevice,
    // ----- actions
    setForceCursorPointer,
    setIsTouchDevice
  }
})
