import { defineNuxtPlugin } from '#app'
import mitt from 'mitt'
import type { Emitter } from 'mitt'

type Events = Record<string, unknown>

const emitter: Emitter<Events> = mitt<Events>()

export default defineNuxtPlugin(() => {
  return {
    provide: {
      bus: {
        $on: emitter.on,
        $off: emitter.off,
        $emit: emitter.emit
      }
    }
  }
})
