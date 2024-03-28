import { promises as fs } from 'fs';
import { Migration, MigrationProvider } from 'kysely';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ESMFileMigrationProvider implements MigrationProvider {
  constructor(private relativePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const resolvedPath = path.resolve(__dirname, this.relativePath);
    const files = await fs.readdir(resolvedPath);

    for (const fileName of files) {
      if (!fileName.endsWith('.ts')) {
        continue;
      }

      const importPath = path
        .join(resolvedPath, fileName)
        .split('\\')
        .join('/');

      const migration = await import(`file://` + importPath);
      const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'));

      migrations[migrationKey] = migration;
    }
    return migrations;
  }
}
