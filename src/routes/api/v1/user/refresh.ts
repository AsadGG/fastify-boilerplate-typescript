import type { AuthenticatedFastifyRequest } from '#src/types/fastify';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { getUserById } from '#repositories/user.repository';
import { ErrorResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { AuthenticateUserSchema } from '#schemas/user.schema';
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

// #region POST
const userSignInSchema = {
  operationId: 'userRefresh',
  tags: ['v1|user'],
  summary: 'User refresh',
  description: 'This will refresh user tokens',
  security: [{ AuthorizationUserRefresh: [] }],
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      AuthenticateUserSchema,
      HTTP_STATUS.OK,
      'Token refreshed successfully.',
    ),
    [HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
      'Unauthorized',
      'Authorization token expired',
    ),
  },
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: AuthenticatedFastifyRequest,
      reply: FastifyReply,
    ) {
      const data = {
        id: request.user.userId,
      };

      const promise = getUserById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);
      if (!ok) {
        return sendError(request, reply, error, data);
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
        message: 'Token refreshed successfully.',
        data: {
          ...result,
          password: undefined,
          accessToken: `${userId}:${accessTokenHash}`,
          refreshToken: `${userId}:${refreshTokenHash}`,
        },
      });
    },
    onRequest: [fastify.authenticateUserRefresh],
    schema: userSignInSchema,
  };
}
// #endregion POST
