import type { ENVSchemaType } from '#configs/environment.config';
import type { FastifyRedisPluginOptions } from '@fastify/redis';

export function redisConfig(config: ENVSchemaType): FastifyRedisPluginOptions {
  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  };
}
