import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('role_privilege')
    .addColumn('role_id', 'uuid', (col) => col.references('role.id').notNull())
    .addColumn('privilege_id', 'uuid', (col) =>
      col.references('privilege.id').notNull()
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addPrimaryKeyConstraint('role_privilege_primary_key', [
      'role_id',
      'privilege_id',
    ])
    .execute();

  await sql`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${sql.table('role_privilege')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('role_privilege').execute();
}
