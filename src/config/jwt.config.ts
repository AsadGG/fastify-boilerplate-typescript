import { FastifyJWTOptions } from '@fastify/jwt';
import { ENVSchemaType } from './env.config.js';

type JWTNamespaces =
  | 'superAdminAccess'
  | 'superAdminRefresh'
  | 'tenantAdminAccess'
  | 'tenantAdminRefresh'
  | 'officeUserAccess'
  | 'officeUserRefresh';

export type CustomJWTOptions = Record<JWTNamespaces, FastifyJWTOptions>;

export function JWTConfig(config: ENVSchemaType): CustomJWTOptions {
  return {
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
  };
}
