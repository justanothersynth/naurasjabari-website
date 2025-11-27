import { config } from './index'

/**
 * Shared Redis connection configuration for BullMQ queues and workers
 */
export const redisConnection = {
  host: config.redis.host,
  port: config.redis.port
}
