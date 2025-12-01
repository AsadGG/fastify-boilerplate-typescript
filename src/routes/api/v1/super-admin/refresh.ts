import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSuperAdminById } from '#repositories/super_admin.repository';
import { ErrorResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { AuthenticateUserSchema } from '#schemas/user.schema';
import { getSha256Hash } from '#utilities/hash';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
} from '#utilities/redis-keys';
import { parse } from '@lukeed/ms';

// #region POST
const superAdminSignInSchema = {
  operationId: 'superAdminRefresh',
  description: 'this will refresh super admin tokens',
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      AuthenticateUserSchema,
      HTTP_STATUS.OK,
      'token refreshed successfully.',
    ),
    [HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
      'Unauthorized',
      'Authorization token expired',
    ),
  },
  security: [{ AuthorizationSuperAdminRefresh: [] }],
  summary: 'super admin refresh',
  tags: ['v1|super admin'],
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest & { user: { superAdminId: string } },
      reply: FastifyReply,
    ) {
      const data = {
        id: request.user.superAdminId,
      };

      const promise = getSuperAdminById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);
      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          message: error.message,
          statusCode,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }

      const superAdminId = result.id;

      const accessToken = fastify.jwt.superAdminAccess.sign({
        superAdminId,
      });
      const refreshToken = fastify.jwt.superAdminRefresh.sign({
        superAdminId,
      });

      const accessTokenHash = getSha256Hash(accessToken);
      const refreshTokenHash = getSha256Hash(refreshToken);

      const { set } = createRedisFunctions(fastify.redis);

      const accessTokenKey = getSuperAdminAccessTokenKey(
        superAdminId,
        accessTokenHash,
      );
      const refreshTokenKey = getSuperAdminRefreshTokenKey(
        superAdminId,
        refreshTokenHash,
      );

      const accessTokenExpiry
        = parse(fastify.config.SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN) ?? 0;
      const refreshTokenExpiry
        = parse(fastify.config.SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN) ?? 0;

      await set(accessTokenKey, accessToken, accessTokenExpiry);
      await set(refreshTokenKey, refreshToken, refreshTokenExpiry);

      if (result.image) {
        result.image.url = `${fastify.config.WEB_SERVER_BASE_URL}${result.image.url}`;
      }

      return reply.status(HTTP_STATUS.OK).send({
        data: {
          ...result,
          password: undefined,
          accessToken: `${superAdminId}:${accessTokenHash}`,
          refreshToken: `${superAdminId}:${refreshTokenHash}`,
        },
        message: 'token refreshed successfully.',
        statusCode: HTTP_STATUS.OK,
      });
    },
    onRequest: [fastify.authenticateSuperAdminRefresh],
    schema: superAdminSignInSchema,
  };
}
// #endregion POST
