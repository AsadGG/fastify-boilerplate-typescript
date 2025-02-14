import { ENVSchemaType } from '#configs/env.config';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

function kyselyConfig(config: ENVSchemaType) {
  return {
    connectionString: config.DATABASE_URL,
    max: 10,
  };
}

export default kyselyConfig;

declare module 'fastify' {
  interface FastifyInstance {
    kysely: Kysely<DB>;
  }
}
