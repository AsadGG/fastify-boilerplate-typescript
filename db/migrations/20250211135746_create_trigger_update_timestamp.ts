import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
  CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
  LANGUAGE plpgsql
  AS
  $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$;
`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP FUNCTION IF EXISTS update_timestamp() CASCADE`.execute(db);
}
