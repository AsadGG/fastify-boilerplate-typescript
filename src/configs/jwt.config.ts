import type { ENVSchemaType } from '#configs/env.config';
import type { FastifyJWTOptions } from '@fastify/jwt';

type JWTNamespaces
  = | 'officeUserAccess'
    | 'officeUserRefresh'
    | 'superAdminAccess'
    | 'superAdminRefresh'
    | 'tenantAdminAccess'
    | 'tenantAdminRefresh';

export type CustomJWTOptions = Record<JWTNamespaces, FastifyJWTOptions>;

export function JWTConfig(config: ENVSchemaType): CustomJWTOptions {
  return {
    officeUserAccess: {
      namespace: 'officeUserAccess',
      secret: config.OFFICE_USER_ACCESS_JWT_SECRET,
      sign: { expiresIn: config.OFFICE_USER_ACCESS_JWT_EXPIRES_IN },
    },
    officeUserRefresh: {
      namespace: 'officeUserRefresh',
      secret: config.OFFICE_USER_REFRESH_JWT_SECRET,
      sign: { expiresIn: config.OFFICE_USER_REFRESH_JWT_EXPIRES_IN },
    },
    superAdminAccess: {
      namespace: 'superAdminAccess',
      secret: config.SUPER_ADMIN_ACCESS_JWT_SECRET,
      sign: { expiresIn: config.SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN },
    },
    superAdminRefresh: {
      namespace: 'superAdminRefresh',
      secret: config.SUPER_ADMIN_REFRESH_JWT_SECRET,
      sign: { expiresIn: config.SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN },
    },
    tenantAdminAccess: {
      namespace: 'tenantAdminAccess',
      secret: config.TENANT_ADMIN_ACCESS_JWT_SECRET,
      sign: { expiresIn: config.TENANT_ADMIN_ACCESS_JWT_EXPIRES_IN },
    },
    tenantAdminRefresh: {
      namespace: 'tenantAdminRefresh',
      secret: config.TENANT_ADMIN_REFRESH_JWT_SECRET,
      sign: { expiresIn: config.TENANT_ADMIN_REFRESH_JWT_EXPIRES_IN },
    },
  } as const;
}
