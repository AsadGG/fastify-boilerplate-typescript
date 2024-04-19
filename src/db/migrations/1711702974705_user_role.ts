import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_role')
    .addColumn('user_id', 'uuid', (col) => col.references('user.id').notNull())
    .addColumn('role_id', 'uuid', (col) => col.references('role.id').notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addPrimaryKeyConstraint('user_role_primary_key', ['user_id', 'role_id'])
    .execute();

  await sql`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${sql.table('user_role')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_role').execute();
}
