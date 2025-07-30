import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { OrpcClient } from '@workspace/types'

type OrpcPlugin = {
  provide: {
    orpc: OrpcClient // authenticates as current user
  }
}

export default defineNuxtPlugin((): OrpcPlugin => {
  const client = createORPCClient(new RPCLink({
    url: useRuntimeConfig().public.apiUrl + '/orpc'
  }))

  return {
    provide: {
      orpc: client as OrpcClient
    }
  }
})
