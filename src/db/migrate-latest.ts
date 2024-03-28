import 'dotenv/config';
import { Kysely, Migrator, PostgresDialect } from 'kysely';
import pg from 'pg';
import { ESMFileMigrationProvider } from './ESMFileMigrationProvider.js';

const { Pool } = pg;

async function migrateToLatest() {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    }),
  });
  const db = new Kysely<any>({
    dialect,
  });

  const migrator = new Migrator({
    db,
    provider: new ESMFileMigrationProvider('migrations'),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    await db.destroy();
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
