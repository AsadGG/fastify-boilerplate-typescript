import type { Kysely } from 'kysely';
import {
  createGenerateUuidV7Function,
  dropGenerateUuidV7Function,
} from '../kysely.utilities';

export async function up(db: Kysely<any>): Promise<void> {
  await createGenerateUuidV7Function.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await dropGenerateUuidV7Function.execute(db);
}
