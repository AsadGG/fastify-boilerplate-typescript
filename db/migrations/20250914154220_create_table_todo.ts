import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { createUpdateTimestampTrigger } from '../kysely.utilities';

export async function up(database: Kysely<any>): Promise<void> {
  await database.schema
    .createTable('todo')
    .addColumn('id', 'uuid', col => col.primaryKey().defaultTo(sql`uuidv7()`))
    .addColumn('task', 'text', col => col.notNull())
    .addColumn('completed', 'boolean', col => col.defaultTo(false).notNull())
    .addColumn('is_active', 'boolean', col => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('deleted_at', 'timestamptz', col => col.defaultTo(null))
    .execute();

  await database.schema
    .createIndex('todo_task_unique_index')
    .on('todo')
    .column('task')
    .unique()
    .where(sql.ref('deleted_at'), 'is', null)
    .execute();

  await createUpdateTimestampTrigger('todo').execute(database);
}

export async function down(database: Kysely<any>): Promise<void> {
  await database.schema.dropTable('todo').execute();
}
