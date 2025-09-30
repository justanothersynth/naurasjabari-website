import { useMousePressed } from '@vueuse/core'

/**
 * Detects mouse clicks anywhere on the page
 * @returns Object containing reactive pressed state and click detection utilities
 */
export const useGlobalClick = () => {
  const { pressed } = useMousePressed()

  /**
   * Watch for click events (when pressed changes from true to false)
   * @param callback - Function to execute when a click is detected
   * @returns Function to stop watching for clicks
   */
  const onGlobalClick = (callback: () => void) => {
    return watch(pressed, (newPressed, oldPressed) => {
      // Detect click completion (pressed went from true to false)
      if (oldPressed && !newPressed) {
        callback()
      }
    })
  }

  return {
    pressed: readonly(pressed),
    onGlobalClick
  }
}
