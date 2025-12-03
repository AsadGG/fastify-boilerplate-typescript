import type { DB } from '#src/types/database';
import type { FastifyInstance } from 'fastify';
import type { PoolConfig } from 'pg';
import fastifyPlugin from 'fastify-plugin';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

const { Pool } = pg;

async function fastifyKysely(fastify: FastifyInstance, options: PoolConfig) {
  const dialect = new PostgresDialect({
    pool: new Pool(options),
  });
  const database = new Kysely<DB>({
    dialect,
    plugins: [new CamelCasePlugin()],
  });
  fastify.decorate('kysely', database).addHook('onClose', async (instance) => {
    /* istanbul ignore else */
    if (instance.kysely === database) {
      instance.kysely.destroy();
    }
  });
}

export default fastifyPlugin(fastifyKysely);

declare module 'fastify' {
  interface FastifyInstance {
    kysely: Kysely<DB>;
  }
}
