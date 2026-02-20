import { createClient as createClientSupabase } from '@supabase/supabase-js'
import { config } from '../config'

const createClient = (token: string) => {
  return createClientSupabase(config.supabase.url, config.supabase.apiKey, {
    accessToken: async () => token
  })
}

export {
  createClient
}
