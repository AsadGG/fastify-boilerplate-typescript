import type { DB } from '#src/types/database';
import type { Kysely } from 'kysely';
import bcrypt from 'bcrypt';

export async function seed(db: Kysely<DB>) {
  const salt = bcrypt.genSaltSync(12);
  const password = await bcrypt.hash('12345678', salt);

  await db
    .insertInto('superAdmin')
    .values({
      email: 'asad@admin.com',
      name: 'Asad',
      password,
      phone: '03001234567',
    })
    .execute();

  await db.destroy();
}
