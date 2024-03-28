import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  db.schema
    .alterTable('user')
    .addColumn('role_id', 'uuid', (col) => col.references('role.id'))
    .execute();
}
export async function down(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('user').dropColumn('role_id').execute();
}
