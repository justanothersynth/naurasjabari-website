import { defineStore } from 'pinia'

export const useGeneralStore = defineStore('general', () => {
  // ===================================================================== state
  const forceCursorPointer = ref(false)

  // =================================================================== actions
  /**
   * Sets the selected hex node
   * @param name - The name of the hex node to set as selected
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
