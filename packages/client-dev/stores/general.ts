import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', () => {
  // ===================================================================== state
  const forceCursorPointer = ref(false)

  // =================================================================== actions
  /**
   * Sets the force cursor pointer state
   * @param force - Whether to force the cursor to be a pointer
   */
  const setForceCursorPointer = (force: boolean) => {
    forceCursorPointer.value = force
  }



  // ==================================================================== return
  return {
    // ----- state
    forceCursorPointer,
    // ----- actions
    setForceCursorPointer
  }
})
