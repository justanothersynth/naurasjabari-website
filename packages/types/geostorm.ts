import { z } from 'zod'

const regions = z.object({
  subAuroral: z.array(z.string()),
  auroral: z.array(z.string()),
  polar: z.array(z.string())
})

export const geostormOrpcInput = z.object({
  last24Hours: regions,
  last6Hours: regions,
  currentConditions: regions,
  next6Hours: regions,
  next24Hours: regions
})

export type GeostormOrpcInput = z.infer<typeof geostormOrpcInput>

export interface GeostormSupabase extends GeostormOrpcInput {
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}
