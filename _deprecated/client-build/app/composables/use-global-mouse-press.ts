import { useMousePressed } from '@vueuse/core'

/**
 * Detects continuous mouse pressing anywhere on the page
 * @returns Object containing reactive pressed state and press detection utilities
 */
export const useGlobalMousePress = () => {
  const { pressed, sourceType } = useMousePressed()
  
  const pressStartTime = ref<number | null>(null)
  const pressDuration = ref(0)
  
  /**
   * Watch for press start events
   * @param callback - Function to execute when pressing starts
   * @returns Function to stop watching for press starts
   */
  const onMousePressStart = (callback: (sourceType: string | null) => void) => {
    return watch(pressed, (newPressed, oldPressed) => {
      if (!oldPressed && newPressed) {
        pressStartTime.value = Date.now()
        callback(sourceType.value)
      }
    })
  }
  
  /**
   * Watch for press end events
   * @param callback - Function to execute when pressing ends
   * @returns Function to stop watching for press ends
   */
  const onMousePressEnd = (callback: (duration: number) => void) => {
    return watch(pressed, (newPressed, oldPressed) => {
      if (oldPressed && !newPressed) {
        const duration = pressStartTime.value ? Date.now() - pressStartTime.value : 0
        pressDuration.value = duration
        pressStartTime.value = null
        callback(duration)
      }
    })
  }
  
  /**
   * Watch for continuous pressing (while pressed is true)
   * @param callback - Function to execute continuously while pressing
   * @param interval - Interval in milliseconds between callback executions (default: 16ms for ~60fps)
   * @returns Object with stop function and interval control
   */
  const onMousePressContinuous = (callback: (duration: number) => void, interval = 16) => {
    let intervalId: NodeJS.Timeout | null = null
    const stopWatching = watch(pressed, (newPressed) => {
      if (newPressed) {
        if (!pressStartTime.value) {
          pressStartTime.value = Date.now()
        }
        intervalId = setInterval(() => {
          if (pressed.value && pressStartTime.value) {
            const currentDuration = Date.now() - pressStartTime.value
            pressDuration.value = currentDuration
            callback(currentDuration)
          }
        }, interval)
      } else {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
        pressStartTime.value = null
      }
    })
    
    const stop = () => {
      stopWatching()
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
    
    return { stop }
  }
  
  return {
    pressed: readonly(pressed),
    sourceType: readonly(sourceType),
    pressDuration: readonly(pressDuration),
    onMousePressStart,
    onMousePressEnd,
    onMousePressContinuous
  }
}
