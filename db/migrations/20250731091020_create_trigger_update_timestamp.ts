import type { Kysely } from 'kysely';
import {
  createUpdateTimestampTriggerFunction,
  dropUpdateTimestampTriggerFunction,
} from '../kysely.utilities';

export async function up(database: Kysely<any>): Promise<void> {
  await createUpdateTimestampTriggerFunction.execute(database);
}

export async function down(database: Kysely<any>): Promise<void> {
  await dropUpdateTimestampTriggerFunction.execute(database);
}
