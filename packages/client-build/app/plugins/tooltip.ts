/**
 * Tooltip plugin that provides global mouse-following tooltip functionality
 * Available as $tooltip in all components
 */
export default defineNuxtPlugin(() => {
  const tooltipStore = useTooltipStore()
  const { x, y } = useMouse({ type: 'client' })

  /**
   * Updates the tooltip position to follow the mouse
   * This is automatically called when the mouse moves
   */
  const updatePosition = () => {
    if (tooltipStore.tooltip.show) {
      tooltipStore.updatePosition(x.value, y.value)
    }
  }

  // Watch mouse position and update tooltip position when it changes
  watch([x, y], updatePosition)

  const tooltip = {
    /**
     * Shows the global tooltip with the specified content
     * The tooltip will follow the mouse cursor
     * @param content - The content to display in the tooltip
     */
    show: (content: string) => {
      tooltipStore.show(content, x.value, y.value)
    },

    /**
     * Hides the global tooltip
     */
    hide: () => {
      tooltipStore.hide()
    },

    /**
     * Gets the current tooltip state (readonly)
     */
    get state() {
      return tooltipStore.tooltip
    }
  }

  return {
    provide: {
      tooltip
    }
  }
})
