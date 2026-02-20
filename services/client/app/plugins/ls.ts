type LocalStorageService = {
  set: (key: string, value: unknown) => void
  get: (key: string) => unknown
  remove: (key: string) => void
}

declare module '#app' {
  interface NuxtApp {
    $ls: LocalStorageService
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ls: LocalStorageService
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const prefix = config.public.ls.prefix

  /**
   * Sets a value in localStorage with automatic prefixing and JSON stringification
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  const set = (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return
    try {
      const prefixedKey = `${prefix}${key}`
      const stringValue = JSON.stringify(value)
      window.localStorage.setItem(prefixedKey, stringValue)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  /**
   * Gets a value from localStorage with automatic prefixing and JSON parsing
   * @param key - The key to retrieve the value from
   * @returns The parsed value or null if not found or error occurs
   */
  const get = (key: string): unknown => {
    if (typeof window === 'undefined') return null
    try {
      const prefixedKey = `${prefix}${key}`
      const item = window.localStorage.getItem(prefixedKey)
      if (item === null) return null
      return JSON.parse(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error getting localStorage key "${key}":`, error)
      return null
    }
  }

  /**
   * Removes a value from localStorage with automatic prefixing
   * @param key - The key to remove
   */
  const remove = (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      const prefixedKey = `${prefix}${key}`
      window.localStorage.removeItem(prefixedKey)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return {
    provide: {
      ls: {
        set,
        get,
        remove
      }
    }
  }
})
