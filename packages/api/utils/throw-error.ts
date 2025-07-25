import { ORPCError } from '@orpc/server'

/**
 * Handles error throwing for oRPC operations
 * If the error is already an ORPCError, rethrows it as-is
 * Otherwise wraps it in a new ORPCError with the specified status
 * @param error The error to throw
 * @param status The HTTP status code to use
 * @param endpoint Endpoint identifier for better error tracing
 */
export const throwError = (
  error: unknown,
  status: 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' = 'BAD_REQUEST',
  endpoint: string
): never => {
  if (error instanceof ORPCError) throw error
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const enhancedMessage = `[${endpoint}] ${errorMessage}`
  
  throw new ORPCError(status, {
    message: enhancedMessage,
    data: {
      originalError: error instanceof Error ? (error as Error & { error?: unknown }).error : undefined,
      endpoint
    }
  })
}
