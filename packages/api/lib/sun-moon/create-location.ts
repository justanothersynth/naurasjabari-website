import { createClient } from '../supabase'
import type { IncomingHttpHeaders } from 'node:http'
import { os, ORPCError } from '@orpc/server'
import { throwError } from '../../utils'
import { authorizeOrpc } from '../../orpc/authorize'
import type { OrpcContext, SunMoonOrpcInput } from '@workspace/types'
import { sunMoonOrpcInput } from '@workspace/types'

const handler = async ({ input, context }: {
  input: SunMoonOrpcInput
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
}) => {
  try {
    const supabase = createClient(context.token)

    const { error } = await supabase
      .from('sun_moon')
      .insert({
        user_id: context.user.sub,
        ...input
      })

    if (error) {
      throw new ORPCError('BAD_REQUEST', {
        message: error.message
      })
    }

    return {
      status: 200,
      message: 'Location created successfully'
    }
  } catch (error: unknown) {
    return throwError(error, 'BAD_REQUEST', 'create-location')
  }
}

export const api = os
  .$context<{ headers: IncomingHttpHeaders }>()
  .use(authorizeOrpc)
  .input(sunMoonOrpcInput)
  .handler(handler)

export const internal = (context: OrpcContext) =>
  os
    .$context<{ headers: IncomingHttpHeaders }>()
    .use(authorizeOrpc)
    .input(sunMoonOrpcInput)
    .handler(handler)
    .callable({ context })

export default {
  api,
  internal
}
