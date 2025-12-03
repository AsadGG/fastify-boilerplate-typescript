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

const database = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export default defineConfig({
  kysely: database,
  migrations: {
    getMigrationPrefix: getKnexTimestampPrefix,
    migrationFolder: `./db/migrations`,
  },
  seeds: {
    seedFolder: `./db/seeds`,
  },
});
