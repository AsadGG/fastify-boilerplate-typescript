import type { FastifyInstance } from 'fastify';
import type { DB } from 'kysely-codegen';
import type { PoolConfig } from 'pg';
import fastifyPlugin from 'fastify-plugin';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

const { Pool } = pg;

async function fastifyKysely(fastify: FastifyInstance, opts: PoolConfig) {
  const dialect = new PostgresDialect({
    pool: new Pool(opts),
  });
  const db = new Kysely<DB>({
    dialect,
    plugins: [new CamelCasePlugin()],
  });
  fastify.decorate('kysely', db).addHook('onClose', async (instance) => {
    /* istanbul ignore else */
    if (instance.kysely === db) {
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
