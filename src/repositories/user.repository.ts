import type { DB } from '#src/types/database';
import type { Kysely } from 'kysely';
import { UserEmailNotFoundError, UserIdNotFoundError } from '#src/errors/user';
import { promiseHandler } from '#utilities/promise-handler';
import { fileJsonExpression } from './query-helpers';

export async function getUserById(
  kysely: Kysely<DB>,
  data: {
    id: string;
  },
) {
  const promise = kysely
    .selectFrom('user')
    .where('user.id', '=', data.id)
    .leftJoin('file', 'file.id', 'user.id')
    .select(eb => [
      'user.email',
      'user.id',
      'user.name',
      'user.password',
      'user.phone',
      fileJsonExpression(eb).as('image'),
    ])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new UserIdNotFoundError(data.id);
  }

  return result;
}

export async function getUserByEmail(
  kysely: Kysely<DB>,
  data: {
    email: string;
  },
) {
  const promise = kysely
    .selectFrom('user')
    .where('user.email', '=', data.email)
    .leftJoin('file', 'file.id', 'user.imageFileId')
    .select(eb => [
      'user.email',
      'user.id',
      'user.name',
      'user.password',
      'user.phone',
      fileJsonExpression(eb).as('image'),
    ])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(promise);

  if (!ok) {
    throw error;
  }

  if (!result) {
    throw new UserEmailNotFoundError(data.email);
  }

  return result;
}
