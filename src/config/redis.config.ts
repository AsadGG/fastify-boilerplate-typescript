import { FastifyRedisPluginOptions } from '@fastify/redis';
import { ENVSchemaType } from './env.config.js';

export function redisConfig(config: ENVSchemaType): FastifyRedisPluginOptions {
  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  };
}
