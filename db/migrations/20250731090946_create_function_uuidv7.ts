import type { Kysely } from 'kysely';
import {
  createGenerateUuidV7Function,
  dropGenerateUuidV7Function,
} from '../kysely.utilities';

export async function up(database: Kysely<any>): Promise<void> {
  await createGenerateUuidV7Function.execute(database);
}

export async function down(database: Kysely<any>): Promise<void> {
  await dropGenerateUuidV7Function.execute(database);
}
