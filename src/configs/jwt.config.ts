import type { ENVSchemaType } from '#configs/environment.config';
import type { FastifyJWTOptions } from '@fastify/jwt';

type JWTNamespaces = 'userAccess' | 'userRefresh';

export type CustomJWTOptions = Record<JWTNamespaces, FastifyJWTOptions>;

export function JWTConfig(config: ENVSchemaType): CustomJWTOptions {
  return {
    userAccess: {
      namespace: 'userAccess',
      secret: config.USER_ACCESS_JWT_SECRET,
      sign: { expiresIn: config.USER_ACCESS_JWT_EXPIRES_IN },
    },
    userRefresh: {
      namespace: 'userRefresh',
      secret: config.USER_REFRESH_JWT_SECRET,
      sign: { expiresIn: config.USER_REFRESH_JWT_EXPIRES_IN },
    },
  } as const;
}
