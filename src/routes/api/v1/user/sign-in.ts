import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getUserByEmail } from '#repositories/user.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { AuthenticateUserSchema } from '#schemas/user.schema';
import { AuthenticationInvalidCredentialsError } from '#src/errors/authentication';
import { getSha256Hash } from '#utilities/hash';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getUserAccessTokenKey,
  getUserRefreshTokenKey,
} from '#utilities/redis-keys';
import { sendError } from '#utilities/send-error';
import { parse } from '@lukeed/ms';
import { Type } from '@sinclair/typebox';

// #region POST
const PostSchemaBody = Type.Object(
  {
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
  },
  { additionalProperties: false },
);
const userSignInSchema = {
  operationId: 'userSignIn',
  tags: ['v1|user'],
  summary: 'Sign in user',
  description: 'This will sign in user',
  body: PostSchemaBody,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      AuthenticateUserSchema,
      HTTP_STATUS.OK,
      'Signed in successfully.',
    ),
    [HTTP_STATUS.UNAUTHORIZED]: EmptyResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'Invalid credentials.',
    ),
  },
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Body: Static<typeof PostSchemaBody>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        ...request.body,
      };
      const promise = getUserByEmail(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);
      if (!ok) {
        error.statusCode === HTTP_STATUS.NOT_FOUND
          ? error.statusCode = HTTP_STATUS.UNAUTHORIZED
          : error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

        error.statusCode === HTTP_STATUS.NOT_FOUND
          ? error.message = 'Invalid credentials.'
          : error.message = 'Something went wrong.';

        return sendError(request, reply, error, data);
      }

      const isPasswordMatch = await fastify.bcrypt.compare(
        request.body.password,
        result.password,
      );

      if (!isPasswordMatch) {
        return sendError(request, reply, new AuthenticationInvalidCredentialsError(), data);
      }

      const userId = result.id;

      const accessToken = fastify.jwt.userAccess.sign({
        userId,
      });

      const refreshToken = fastify.jwt.userRefresh.sign({
        userId,
      });

      const accessTokenHash = getSha256Hash(accessToken);
      const refreshTokenHash = getSha256Hash(refreshToken);

      const { set } = createRedisFunctions(fastify.redis);

      const accessTokenKey = getUserAccessTokenKey(
        userId,
        accessTokenHash,
      );
      const refreshTokenKey = getUserRefreshTokenKey(
        userId,
        refreshTokenHash,
      );

      const accessTokenExpiry
        = parse(fastify.config.USER_ACCESS_JWT_EXPIRES_IN) ?? 0;
      const refreshTokenExpiry
        = parse(fastify.config.USER_REFRESH_JWT_EXPIRES_IN) ?? 0;

      await set(accessTokenKey, accessToken, accessTokenExpiry);
      await set(refreshTokenKey, refreshToken, refreshTokenExpiry);

      if (result.image) {
        result.image.url = `${fastify.config.WEB_SERVER_BASE_URL}${result.image.url}`;
      }

      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Signed in successfully.',
        data: {
          ...result,
          password: undefined,
          accessToken: `${userId}:${accessTokenHash}`,
          refreshToken: `${userId}:${refreshTokenHash}`,
        },
      });
    },
    schema: userSignInSchema,
  };
}
// #endregion POST
