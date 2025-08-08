import type { IncomingHttpHeaders } from 'http'
import type { RouterClient } from '@orpc/server'
import { router } from '@workspace/api/orpc/router'

export interface OrpcContext {
  headers: IncomingHttpHeaders
}

export type OrpcClient = RouterClient<typeof router>
