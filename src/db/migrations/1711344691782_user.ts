import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('first_name', 'text', (col) => col.notNull())
    .addColumn('last_name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('password', 'text', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('amount', 'decimal(10, 2)', (col) =>
      col.defaultTo(0).unique().notNull()
    )
    .addColumn('phone', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addUniqueConstraint('email_phone_unique', ['email', 'phone'])
    .execute();

  await sql`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${sql.table('user')}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp()`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute();
}
