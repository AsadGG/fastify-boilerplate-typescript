import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable('super_admin')
    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('email', 'text', col => col.notNull())
    .addColumn('phone', 'text', col => col.notNull())
    .addColumn('image_file_id', 'uuid', col =>
      col.references('file.id').onDelete('set null'))
    .addUniqueConstraint('email_unique', ['email'])
    .addUniqueConstraint('phone_unique', ['phone'])
    .execute();

  await database.schema
    .createIndex('super_admin_image_file_id_index')
    .on('super_admin')
    .column('image_file_id')
    .execute();
}

export async function down(database: Kysely<any>): Promise<void> {
  await database.schema.dropTable('super_admin').execute();
}
