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
    connectionString: config.DATABASE_URL,
    max: 10,
  };
}

export default kyselyConfig;
