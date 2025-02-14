import { ENVSchemaType } from '#configs/env.config';
import { FastifyRedisPluginOptions } from '@fastify/redis';

export function redisConfig(config: ENVSchemaType): FastifyRedisPluginOptions {
  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  };
}
