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
