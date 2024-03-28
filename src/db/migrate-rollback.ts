import 'dotenv/config';
import { Kysely, Migrator, NO_MIGRATIONS, PostgresDialect } from 'kysely';
import pg from 'pg';
import { ESMFileMigrationProvider } from './ESMFileMigrationProvider.js';

const { Pool } = pg;

async function rollbackMigration() {
  const argumentSeparatorIndex = process.argv.findIndex(
    (item) => item === '--'
  );
  const nameArgument = process.argv[argumentSeparatorIndex + 1];

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

  if (!nameArgument) {
    const { error, results } = await migrator.migrateTo(NO_MIGRATIONS);
    console.log('results :>> ', results);
    if (error) {
      console.error('failed to rollback');
      console.error(error);
      await db.destroy();
      process.exit(1);
    }
  }

  const { error: toError, results: toResults } =
    await migrator.migrateTo(nameArgument);

  if (toError) {
    console.error(`failed to rollback to ${nameArgument}`);
    console.error(toError);
    await db.destroy();
    process.exit(1);
  }

  const { error: downError, results: downResults } =
    await migrator.migrateDown();

  const downResult = downResults?.at(0);
  if (downResult) {
    console.log(
      `${downResult.migrationName} ${downResult.direction} ${downResult.status}`
    );
  }

  if (downError) {
    console.error(`failed to rollback to ${nameArgument}`);
    console.error(downError);
    await db.destroy();
    process.exit(1);
  }
  await db.destroy();
  process.exit(0);
}

rollbackMigration();
