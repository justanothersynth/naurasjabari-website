import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { OrpcClient } from '@workspace/types'

type OrpcPlugin = {
  provide: {
    orpc: OrpcClient // authenticates as current user
  }
}

export default defineNuxtPlugin((): OrpcPlugin => {
  const { getToken, isSignedIn } = useAuth()

  const getHeaders = async () => {
    if (!isSignedIn.value) return {}
    const token = await getToken.value()
    if (!token) return {}
    return {
      authorization: `Bearer ${token}`
    }
  }

  // Base client that always uses the currently logged in user's token
  const client = createORPCClient(new RPCLink({
    url: useRuntimeConfig().public.apiUrl + '/orpc',
    headers: getHeaders
  }))

  return {
    provide: {
      orpc: client as OrpcClient
    }
  }
})
