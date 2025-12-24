import HTTP_STATUS from '#utilities/http-status-codes';
import createError from '@fastify/error';

export const UserIdNotFoundError = createError(
  'APP_USER_ID_NOT_FOUND',
  'User with id \'%s\' does not exist',
  HTTP_STATUS.NOT_FOUND,
);

export const UserEmailNotFoundError = createError(
  'APP_USER_EMAIL_NOT_FOUND',
  'User with email \'%s\' does not exist',
  HTTP_STATUS.NOT_FOUND,
);
