import type { OrpcContext, GeostormOrpcInput } from '@workspace/types'
import { generateInternalJWT } from '@workspace/utils'
import { createEntry } from '@workspace/api/lib/geostorm'
import { config } from '../../config'

/**
 * Writes geostorm data to the database
 * @param data - The geostorm data to write
 */
export const writeData = async (data: GeostormOrpcInput) => {
  // Generate internal JWT for authentication
  const token = await generateInternalJWT(
    config.supabase.jwtSecret,
    config.supabase.jwtIssuer,
    config.supabase.jwtSubject
  )

  const orpcContext: OrpcContext = {
    headers: { authorization: `Bearer ${token}` }
  }

  await createEntry.internal(orpcContext)(data)
}
