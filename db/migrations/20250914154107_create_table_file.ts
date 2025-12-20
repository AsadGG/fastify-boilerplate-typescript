import type { Kysely } from 'kysely';
import { sql } from 'kysely';

const TABLE_FILE = 'file';

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable(TABLE_FILE)
    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('url', 'text', col => col.notNull())
    .addColumn('filename', 'text', col => col.notNull())
    .addColumn('mimetype', 'text', col => col.notNull())
    .addColumn('size', 'bigint', col => col.notNull())
    .execute();
}

export async function down(database: Kysely<any>): Promise<void> {
  await database.schema.dropTable(TABLE_FILE).execute();
}
