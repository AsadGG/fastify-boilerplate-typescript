import { sql } from 'kysely';

export const createUpdateTimestampTriggerFunction = sql`
create or replace function update_timestamp()
  returns trigger
  language plpgsql
  as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$
`;

export const dropUpdateTimestampTriggerFunction = sql`drop function if exists update_timestamp() cascade;`;

export function createUpdateTimestampTrigger(tableName: string) {
  return sql`
  create trigger update_timestamp
  before update on ${sql.table(tableName)} for each row
  execute procedure update_timestamp()
  `;
}

export const createGenerateUuidV7Function = sql`
create or replace function uuidv7()
  returns uuid
  as $$
  select encode(set_bit(set_bit(overlay(uuid_send(gen_random_uuid())
          placing substring(int8send((extract(epoch from clock_timestamp()) * 1000)::bigint)
        from 3)
      from 1 for 6), 52, 1), 53, 1), 'hex')::uuid;
$$
language sql
volatile parallel safe;
`;

export const dropGenerateUuidV7Function = sql`drop function if exists uuidv7() cascade;`;
