/**
 * A class for managing localStorage with a configurable prefix
 */
class Ls {
  private prefix: string

  /**
   * Creates a new Ls instance
   * @param options - Configuration options. The prefix property defines the prefix to use for the localStorage key.
   */
  constructor(options: { prefix?: string }) {
    this.prefix = options.prefix || 'zero__'
  }

  /**
   * Gets a value from localStorage
   * @param key - The key to retrieve
   * @returns The stored value or null if not found
   */
  get(key: string): string | null {
    return localStorage.getItem(`${this.prefix}${key}`) || null
  }

  /**
   * Sets a value in localStorage
   * @param key - The key to set
   * @param value - The value to store
   */
  set(key: string, value: string): void {
    localStorage.setItem(`${this.prefix}${key}`, value)
  }

  /**
   * Removes a value from localStorage
   * @param key - The key to remove
   */
  remove(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`)
  }
}

/**
 * Creates a new Ls instance with runtime configuration
 * @returns A new Ls instance
 * @example
 * ```ts
 * const ls = useLs()
 * ls.set('user', 'John')
 * const user = ls.get('user') // 'John'
 * ls.remove('user')
 * ```
 */
export default (): Ls => {
  const config = useRuntimeConfig()
  return new Ls(config.public.ls || {})
}
