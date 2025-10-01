import { FastifyEnvOptions } from '@fastify/env';
import { Static, Type } from '@sinclair/typebox';

const ENV_SCHEMA = Type.Object({
  WEB_SERVER_BIND_ADDRESS: Type.String(),
  WEB_SERVER_PORT: Type.Integer({
    maximum: 65535,
    minimum: 1000,
  }),
  WEB_SERVER_BASE_URL: Type.String(),

  DATABASE_URL: Type.String(),

  SUPER_ADMIN_ACCESS_JWT_SECRET: Type.String(),
  SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN: Type.String(),
  SUPER_ADMIN_REFRESH_JWT_SECRET: Type.String(),
  SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN: Type.String(),
  TENANT_ADMIN_ACCESS_JWT_SECRET: Type.String(),
  TENANT_ADMIN_ACCESS_JWT_EXPIRES_IN: Type.String(),
  TENANT_ADMIN_REFRESH_JWT_SECRET: Type.String(),
  TENANT_ADMIN_REFRESH_JWT_EXPIRES_IN: Type.String(),
  OFFICE_USER_ACCESS_JWT_SECRET: Type.String(),
  OFFICE_USER_ACCESS_JWT_EXPIRES_IN: Type.String(),
  OFFICE_USER_REFRESH_JWT_SECRET: Type.String(),
  OFFICE_USER_REFRESH_JWT_EXPIRES_IN: Type.String(),

  REDIS_PORT: Type.Integer({
    maximum: 65535,
    minimum: 1000,
  }),
  REDIS_HOST: Type.String(),

  STATIC_SERVE_FOLDER: Type.String(),
  STATIC_SERVE_PREFIX: Type.String(),

  CRON_SECRET: Type.String(),
});

export type ENVSchemaType = Static<typeof ENV_SCHEMA>;

function envConfig(): FastifyEnvOptions {
  return {
    confKey: 'config',
    dotenv: {
      path: `.env`,
    },
    ajv: {
      customOptions: (ajv: any) => ajv.addSchema({ coerceTypes: true }),
    },
    schema: ENV_SCHEMA,
  };
}

export default envConfig;

declare module 'fastify' {
  interface FastifyInstance {
    config: ENVSchemaType;
  }
}
