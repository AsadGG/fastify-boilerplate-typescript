import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

export async function getSuperAdminById(
  kysely: Kysely<DB>,
  data: {
    id: string;
  }
) {
  return kysely
    .selectFrom('superAdmin')
    .select(['email', 'id', 'image', 'name', 'password', 'phone'])
    .where('id', '=', data.id)
    .executeTakeFirstOrThrow();
}

export async function getSuperAdminByEmail(
  kysely: Kysely<DB>,
  data: {
    email: string;
  }
) {
  return kysely
    .selectFrom('superAdmin')
    .select(['email', 'id', 'image', 'name', 'password', 'phone'])
    .where('email', '=', data.email)
    .executeTakeFirstOrThrow();
}
