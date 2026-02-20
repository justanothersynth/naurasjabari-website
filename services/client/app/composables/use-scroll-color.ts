import { useScroll } from '@vueuse/core'

/**
 * Color definition type
 */
type ColorDefinition = {
  color: string
  opacity: number
  borderColor?: string
}

/**
 * iOS/iPadOS color palette
 * One color per category
 */
const IOS_COLORS: ColorDefinition[] = [
  { color: '#FFFFF8', opacity: 0.8, borderColor: '#EBE6E7' }, // Gray
  { color: '#34C759', opacity: 0.2 }, // Green
  { color: '#5AC8FA', opacity: 0.2 }, // Teal
  { color: '#007AFF', opacity: 0.2 }, // Blue
  { color: '#5856D6', opacity: 0.2 }, // Indigo
  { color: '#AF52DE', opacity: 0.2 }, // Purple
  { color: '#FF2D55', opacity: 0.2 },  // Pink
  { color: '#FF9500', opacity: 0.2 }, // Orange
  { color: '#FF3B30', opacity: 0.2 }, // Red
  { color: '#FFCC00', opacity: 0.2 } // Yellow
]

/**
 * Parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1]!, 16),
        g: Number.parseInt(result[2]!, 16),
        b: Number.parseInt(result[3]!, 16)
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Interpolate between two hex colors with opacity
 * @param hex1 - First hex color
 * @param hex2 - Second hex color
 * @param opacity1 - First opacity
 * @param opacity2 - Second opacity
 * @param t - Interpolation factor (0-1)
 */
function interpolateColor(
  hex1: string,
  hex2: string,
  opacity1: number,
  opacity2: number,
  t: number
): string {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t)
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t)
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t)
  const opacity = opacity1 + (opacity2 - opacity1) * t

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Composable that returns background and border colors that transition
 * through iOS/iPadOS colors based on scroll position
 */
export const useScrollColor = () => {
  const { y } = useScroll(window, { throttle: 16 })

  const getColors = () => {
    if (import.meta.client) {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const maxScroll = scrollHeight - clientHeight

      // Avoid division by zero on short pages
      if (maxScroll <= 0) {
        const firstColor = IOS_COLORS[0]!
        const bg = interpolateColor(firstColor.color, firstColor.color, firstColor.opacity, firstColor.opacity, 0)
        const border = firstColor.borderColor
          ? interpolateColor(firstColor.borderColor, firstColor.borderColor, firstColor.opacity, firstColor.opacity, 0)
          : bg
        return { bg, border }
      }

      // Calculate scroll progress (0-1)
      const progress = clamp(y.value / maxScroll, 0, 1)

      // Map progress to color indices
      const colorIndex = progress * (IOS_COLORS.length - 1)
      const index1 = Math.floor(colorIndex)
      const index2 = Math.ceil(colorIndex)
      const t = colorIndex % 1

      const color1 = IOS_COLORS[index1]!
      const color2 = IOS_COLORS[index2]!

      // Interpolate background color
      const bg = interpolateColor(color1.color, color2.color, color1.opacity, color2.opacity, t)

      // Interpolate border color (use borderColor if defined, otherwise use bg color)
      const borderColor1 = color1.borderColor || color1.color
      const borderColor2 = color2.borderColor || color2.color
      const border = interpolateColor(borderColor1, borderColor2, color1.opacity, color2.opacity, t)

      return { bg, border }
    }

    // Default colors for SSR
    const firstColor = IOS_COLORS[0]!
    const bg = interpolateColor(firstColor.color, firstColor.color, firstColor.opacity, firstColor.opacity, 0)
    const border = firstColor.borderColor
      ? interpolateColor(firstColor.borderColor, firstColor.borderColor, firstColor.opacity, firstColor.opacity, 0)
      : bg
    return { bg, border }
  }

  const bgColor = computed(() => getColors().bg)
  const borderColor = computed(() => getColors().border)

  return {
    bgColor,
    borderColor
  }
}
