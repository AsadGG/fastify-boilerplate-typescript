import HTTP_STATUS from '#utilities/http-status-codes';
import createError from '@fastify/error';

export const AuthenticationInvalidCredentialsError = createError(
  'APP_AUTHENTICATION_INVALID_CREDENTIALS',
  'Invalid credentials.',
  HTTP_STATUS.UNAUTHORIZED,
);
