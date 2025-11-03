import type { DB } from 'kysely-codegen';
import process from 'node:process';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';
import pg from 'pg';

const { Pool } = pg;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: `./db/migrations`,
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    seedFolder: `./db/seeds`,
  },
});
