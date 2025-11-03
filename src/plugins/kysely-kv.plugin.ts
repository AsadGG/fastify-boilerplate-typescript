import type { FastifyInstance } from 'fastify';
import type { Kysely } from 'kysely';
import fastifyPlugin from 'fastify-plugin';
import { sql } from 'kysely';

function getTableQuery(
  table: string,
  useUnloggedTable: boolean,
  schema: string,
) {
  const schemaTable = `"${schema}"."${table}"`;
  return sql`
    CREATE ${useUnloggedTable ? sql.raw('UNLOGGED ') : sql.raw('')}TABLE IF NOT EXISTS ${sql.raw(schemaTable)} (
      key text PRIMARY KEY,
      value text NOT NULL,
      expires_at timestamptz NULL
    )
  `;
}

declare module 'fastify' {
  interface FastifyInstance {
    kvStore: {
      get: <T = unknown>(key: string) => Promise<T | null>;
      set: <T = unknown>(
        key: string,
        value: T,
        ttlMs?: number,
      ) => Promise<void>;
      del: (keys: string | string[]) => Promise<void>;
      keys: (pattern: string) => Promise<string[]>;
    };
  }
}
export interface FastifyKyselyKVStoreOptions {
  table: string;
  schema?: string;
  useUnloggedTable?: boolean;
}
async function fastifyKyselyKVStore(
  fastify: FastifyInstance,
  opts: FastifyKyselyKVStoreOptions,
) {
  const schema = opts.schema ?? 'public';
  const table = opts.table;
  const useUnloggedTable = opts.useUnloggedTable ?? false;

  if (!('kysely' in fastify)) {
    throw new Error(
      '[fastify-kysely-kv-store] fastify.kysely not found. '
      + 'Make sure to register fastify-kysely before this plugin.',
    );
  }

  const db = fastify.kysely as Kysely<any>;

  const tableExists = await db
    .selectFrom('information_schema.tables')
    .select('table_name')
    .where('table_schema', '=', schema)
    .where('table_name', '=', table)
    .executeTakeFirst();

  if (!tableExists) {
    await getTableQuery(table, useUnloggedTable, schema).execute(db);
  }

  const kvStore = {
    async get<T = unknown>(key: string): Promise<T | null> {
      const row = await db
        .withSchema(schema)
        .selectFrom(table)
        .select(['value', 'expiresAt'])
        .where('key', '=', key)
        .executeTakeFirst();

      if (!row)
        return null;

      if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
        await kvStore.del(key);
        return null;
      }

      try {
        const stringifiedJson = row.value;
        return JSON.parse(stringifiedJson);
      }
      catch {
        await kvStore.del(key);
        return null;
      }
    },

    async set<T = unknown>(
      key: string,
      value: T,
      ttlMs?: number,
    ): Promise<void> {
      const stringifiedJson = JSON.stringify(value);
      const expiresAt = ttlMs ? new Date(Date.now() + ttlMs) : null;

      await db
        .withSchema(schema)
        .insertInto(table)
        .values({ key, value: stringifiedJson, expiresAt })
        .onConflict(oc =>
          oc.column('key').doUpdateSet({ value: stringifiedJson, expiresAt }),
        )
        .execute();
    },

    async del(keys: string | string[]): Promise<void> {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      if (keysArray.length === 0)
        return;

      await db
        .withSchema(schema)
        .deleteFrom(table)
        .where('key', 'in', keysArray)
        .execute();
    },

    async keys(pattern: string): Promise<string[]> {
      const sqlPattern = pattern.replace(/\*/g, '%');

      const rows = await db
        .withSchema(schema)
        .selectFrom(table)
        .select('key')
        .where('key', 'like', sqlPattern)
        .execute();

      return rows.map(r => r.key);
    },
  };

  fastify.decorate('kvStore', kvStore);
}

export default fastifyPlugin(fastifyKyselyKVStore, {
  name: 'fastify-kysely-kv-store',
  dependencies: ['fastify-kysely'],
});
