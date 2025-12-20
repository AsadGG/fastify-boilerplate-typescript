import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { createUpdateTimestampTrigger } from '../kysely.utilities';

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable('user')
    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('email', 'text', col => col.notNull())
    .addColumn('phone', 'text', col => col.notNull())
    .addColumn('image_file_id', 'uuid', col =>
      col.references('file.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamptz', col => col.defaultTo(null))
    .addUniqueConstraint('email_unique', ['email'])
    .addUniqueConstraint('phone_unique', ['phone'])
    .execute();

  await database.schema
    .createIndex('user_image_file_id_index')
    .on('user')
    .column('image_file_id')
    .execute();

  await createUpdateTimestampTrigger('user').execute(database);
}

export async function down(database: Kysely<any>): Promise<void> {
  await database.schema.dropTable('user').execute();
}
