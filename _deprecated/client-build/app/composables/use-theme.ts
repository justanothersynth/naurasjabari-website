import { usePreferredDark } from '@vueuse/core'

/**
 * Composable for managing application theme
 */
export default function useTheme() {
  if (import.meta.server) { return }
  const isDark = usePreferredDark()
  const version = ref(0)

  /**
   * Watch for theme changes and update favicon
   */
  watch(isDark, () => {
    const theme = isDark.value ? 'light' : 'dark'
    version.value++
    useHead({
      meta: [
        {
          name: 'msapplication-config',
          content: `/favicon/${theme}/browserconfig.xml?v=${version.value}`
        }
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: `/favicon/${theme}/favicon-96x96.png?v=${version.value}`
        },
        {
          rel: 'manifest',
          href: `/favicon/${theme}/manifest.json?v=${version.value}`
        }
      ]
    })
  }, { immediate: true })
}
