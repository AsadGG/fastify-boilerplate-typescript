import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('privilege_type')
    .asEnum(['Frontend', 'Backend', 'Hybrid'])
    .execute();

  await db.schema
    .createTable('privilege')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('is_deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('privilege_type', sql`privilege_type`, (col) =>
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
    ON ${sql.table('privilege')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('privilege').execute();

  await db.schema.dropType('privilege_type').ifExists().execute();
}
