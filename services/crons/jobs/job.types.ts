import { z } from 'zod'

// Base job interface with generic options
export interface Job<TOptions = unknown> {
  name: string
  description: string
  optionsSchema?: z.ZodSchema<TOptions>
  run: (options?: TOptions) => Promise<void>
}
