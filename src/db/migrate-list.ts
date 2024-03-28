import chalk from 'chalk';
import 'dotenv/config';
import { promises as fs } from 'fs';
import { Kysely, PostgresDialect } from 'kysely';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listMigrations(): Promise<void> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    }),
  });
  const db = new Kysely<any>({
    dialect,
  });

  const kyselyMigrations = await db
    .selectFrom('kysely_migration')
    .select('name')
    .execute();

  const completedMigrations: Array<string> = kyselyMigrations.map(
    (kyselyMigration) => kyselyMigration.name
  );

  if (completedMigrations.length) {
    console.log(
      chalk.green(
        `Found ${completedMigrations.length} Completed Migration file/files.`
      )
    );
  } else {
    console.log(chalk.red(`No Completed Migration files Found.`));
  }

  completedMigrations.forEach((completedMigration) => {
    console.log(chalk.blue(completedMigration));
  });

  const resolvedPath = path.resolve(__dirname, 'migrations');
  const files = await fs.readdir(resolvedPath);

  const incompleteMigrations = files
    .map((fileName) => fileName.substring(0, fileName.lastIndexOf('.')))
    .filter(
      (fileName) =>
        !completedMigrations.some(
          (completedMigration) => fileName === completedMigration
        )
    );

  if (incompleteMigrations.length) {
    console.log(
      chalk.green(
        `Found ${incompleteMigrations.length} Pending Migration file/files.`
      )
    );
  } else {
    console.log(chalk.red(`No Pending Migration files Found.`));
  }

  incompleteMigrations.forEach((incompleteMigrations) => {
    console.log(chalk.blue(incompleteMigrations));
  });
  await db.destroy();
  process.exit(0);
}

listMigrations();
