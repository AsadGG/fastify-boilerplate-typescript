import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function makeMigration() {
  const argumentSeparatorIndex = process.argv.findIndex(
    (item) => item === '--'
  );
  const nameArgument = process.argv[argumentSeparatorIndex + 1];
  if (!nameArgument) {
    console.error('argument name not provided');
    process.exit(1);
  }

  const fileCode =
    `import { Kysely } from 'kysely';` +
    '\n' +
    '\n' +
    `export async function up(db: Kysely<any>): Promise<void> {` +
    '\n' +
    `  // Migration code` +
    '\n' +
    `}` +
    '\n' +
    '\n' +
    `export async function down(db: Kysely<any>): Promise<void> {` +
    '\n' +
    `  // Migration code` +
    '\n' +
    `}`;

  const filePath = path.join(
    __dirname,
    'migrations',
    `${Date.now()}_${nameArgument}.ts`
  );
  fs.writeFileSync(filePath, fileCode);
}

makeMigration();
