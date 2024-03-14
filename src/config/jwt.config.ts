import { FastifyJWTOptions } from '@fastify/jwt';
import { ENVSchemaType } from './env.config.js';

export function JWTConfig(config: ENVSchemaType): FastifyJWTOptions {
  return { secret: config.JWT_SECRET };
}
