import { MyError } from '#src/types/my-error';
import HTTP_STATUS from '#utilities/http-status';
import { promiseHandler } from '#utilities/promise-handler';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

export async function getSuperAdminById(
  kysely: Kysely<DB>,
  data: {
    id: string;
  }
) {
  const promise = kysely
    .selectFrom('superAdmin')
    .select(['email', 'id', 'image', 'name', 'password', 'phone'])
    .where('id', '=', data.id)
    .executeTakeFirst();

  const [result, error, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    const error = new Error(
      `super admin of id "${data.id}" does not exist`
    ) as MyError;
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  return result;
}

export async function getSuperAdminByEmail(
  kysely: Kysely<DB>,
  data: {
    email: string;
  }
) {
  const promise = kysely
    .selectFrom('superAdmin')
    .select(['email', 'id', 'image', 'name', 'password', 'phone'])
    .where('email', '=', data.email)
    .executeTakeFirst();

  const [result, error, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    const error = new Error(
      `super admin of email "${data.email}" does not exist`
    ) as MyError;
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  return result;
}
