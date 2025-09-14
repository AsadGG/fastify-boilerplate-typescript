import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('file')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('filename', 'text', (col) => col.notNull())
    .addColumn('mimetype', 'text', (col) => col.notNull())
    .addColumn('size', 'bigint', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('file').execute();
}
