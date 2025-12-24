import HTTP_STATUS from '#utilities/http-status-codes';
import createError from '@fastify/error';

export const TodoIdNotFoundError = createError(
  'APP_TODO_ID_NOT_FOUND',
  'Todo with id \'%s\' does not exist',
  HTTP_STATUS.NOT_FOUND,
);

export const TodoAlreadyExistsError = createError(
  'APP_TODO_ALREADY_EXISTS',
  'Todo \'%s\' already exists',
  HTTP_STATUS.CONFLICT,
);
