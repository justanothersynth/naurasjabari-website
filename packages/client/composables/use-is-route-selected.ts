/**
 * Determines if a route path should be marked as selected
 * @param targetPath - The path to check against the current route
 * @param matchMode - How to match the path ('exact' | 'startsWith')
 */
export const useIsRouteSelected = (targetPath: string, matchMode: 'exact' | 'startsWith' = 'exact'): boolean => {
  const route = useRoute()
  const currentPath = route.path
  switch (matchMode) {
    case 'exact':
      return currentPath === targetPath
    case 'startsWith':
      return currentPath.startsWith(targetPath) && targetPath !== '/'
    default:
      return currentPath === targetPath
  }
}
