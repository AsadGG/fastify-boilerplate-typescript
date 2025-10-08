import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import createError from '@fastify/error';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';
import { fileJsonExpression } from './query-helpers';

const SuperAdminIdNotFoundError = createError(
  'APP_SUPER_ADMIN_ID_NOT_FOUND',
  "super admin with id '%s' does not exist",
  HTTP_STATUS.NOT_FOUND
);

const SuperAdminEmailNotFoundError = createError(
  'APP_SUPER_ADMIN_EMAIL_NOT_FOUND',
  "Super admin with email '%s' does not exist",
  HTTP_STATUS.NOT_FOUND
);

export async function getSuperAdminById(
  kysely: Kysely<DB>,
  data: {
    id: string;
  }
) {
  const promise = kysely
    .selectFrom('superAdmin')
    .where('superAdmin.id', '=', data.id)
    .leftJoin('file', 'file.id', 'superAdmin.id')
    .select((eb) => [
      'superAdmin.email',
      'superAdmin.id',
      'superAdmin.name',
      'superAdmin.password',
      'superAdmin.phone',
      fileJsonExpression(eb).as('image'),
    ])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new SuperAdminIdNotFoundError(data.id);
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
    .where('superAdmin.email', '=', data.email)
    .leftJoin('file', 'file.id', 'superAdmin.imageFileId')
    .select((eb) => [
      'superAdmin.email',
      'superAdmin.id',
      'superAdmin.name',
      'superAdmin.password',
      'superAdmin.phone',
      fileJsonExpression(eb).as('image'),
    ])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new SuperAdminEmailNotFoundError(data.email);
  }

  return result;
}
