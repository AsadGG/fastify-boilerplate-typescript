import { type Kysely } from 'kysely';
import {
  createUpdateTimestampTriggerFunction,
  dropUpdateTimestampTriggerFunction,
} from '../kysely.utilities';

export async function up(db: Kysely<any>): Promise<void> {
  await createUpdateTimestampTriggerFunction.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await dropUpdateTimestampTriggerFunction.execute(db);
}
