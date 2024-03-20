import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';
import { ENVSchemaType } from './env.config.js';

declare module 'fastify' {
  interface FastifyInstance {
    kysely: Kysely<DB>;
  }
}

function kyselyConfig(config: ENVSchemaType) {
  return {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DATABASE,
    max: 10,
  };
}

export default kyselyConfig;
