import { sql, type Kysely } from 'kysely';
import { createUpdateTimestampTrigger } from '../kysely.utilities';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('todo')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('task', 'text', (col) => col.notNull())
    .addColumn('completed', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('deleted_at', 'timestamptz', (col) => col.defaultTo(null))
    .execute();

  await db.schema
    .createIndex('todo_task_unique')
    .on('todo')
    .column('task')
    .unique()
    .where(sql.ref('deleted_at'), 'is', null)
    .execute();

  await createUpdateTimestampTrigger('todo').execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('todo').execute();
}
