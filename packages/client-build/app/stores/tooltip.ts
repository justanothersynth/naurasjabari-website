export const useTooltipStore = defineStore('tooltip', () => {
  // ===================================================================== state
  const tooltip = reactive({
    show: false,
    content: '',
    x: 0,
    y: 0
  })

  // =================================================================== actions
  /**
   * Shows the tooltip at the specified position
   * @param content - The tooltip content to display
   * @param x - The x coordinate for tooltip positioning
   * @param y - The y coordinate for tooltip positioning
   */
  const show = (content: string, x: number, y: number) => {
    tooltip.content = content
    tooltip.x = x
    tooltip.y = y
    tooltip.show = true
  }

  /**
   * Hides the tooltip
   */
  const hide = () => {
    tooltip.show = false
    tooltip.content = ''
  }

  /**
   * Updates the tooltip position
   * @param x - The x coordinate for tooltip positioning
   * @param y - The y coordinate for tooltip positioning
   */
  const updatePosition = (x: number, y: number) => {
    tooltip.x = x
    tooltip.y = y
  }

  // ==================================================================== return
  return {
    // ----- state
    tooltip,
    // ----- actions
    show,
    hide,
    updatePosition
  }
})
