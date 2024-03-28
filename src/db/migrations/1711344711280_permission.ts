import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('permission_type')
    .asEnum(['Frontend', 'Backend', 'Hybrid'])
    .execute();

  await db.schema
    .createTable('permission')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('permission_sequence', 'text', (col) => col.notNull())
    .addColumn('permission_parent', 'text', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('show_on_menu', 'boolean', (col) =>
      col.defaultTo(false).notNull()
    )
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('permission_type', sql`permission_type`, (col) =>
      col.defaultTo('Frontend')
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await sql`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${sql.table('permission')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('permission').execute();

  await db.schema.dropType('permission_type').ifExists().execute();
}
