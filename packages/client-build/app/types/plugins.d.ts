import type { Emitter } from 'mitt'
import type { SeoEntry } from '@@/modules/seo/types'

declare module '#app' {
  interface NuxtApp {
    $bus: {
      $on: Emitter<Record<string, unknown>>['on']
      $off: Emitter<Record<string, unknown>>['off']
      $emit: Emitter<Record<string, unknown>>['emit']
    }
    $tooltip: {
      show: (content: string) => void
      hide: () => void
      state: { show: boolean; content: string; x: number; y: number }
    }
    $seo: (key?: string, override?: Partial<SeoEntry>) => void
  }
}

export {}
