import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('role_permission')
    .addColumn('user_id', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('role_id', 'uuid', (col) => col.references('role.id').notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addPrimaryKeyConstraint('role_permission_primary_key', [
      'user_id',
      'role_id',
    ])
    .execute();

  await sql`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${sql.table('role_permission')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('role_permission').execute();
}
