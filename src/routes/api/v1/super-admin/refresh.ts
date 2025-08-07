import { getSuperAdminById } from '#repositories/super_admin.repository';
import { getSha256Hash } from '#utilities/hash';
import HTTP_STATUS from '#utilities/http-status';
import { promiseHandler } from '#utilities/promise-handler';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
} from '#utilities/redis-keys';
import { parse } from '@lukeed/ms';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const superAdminSignInSchema = {
  description: 'this will refresh super admin tokens',
  tags: ['v1|super admin'],
  summary: 'super admin refresh',
  security: [{ AuthorizationSuperAdminRefresh: [] }],
  operationId: 'superAdminRefresh',
};
export function POST(fastify: FastifyInstance) {
  return {
    schema: superAdminSignInSchema,
    onRequest: [fastify.authenticateSuperAdminRefresh],
    handler: async function (
      request: FastifyRequest & { user: { superAdminId: string } },
      reply: FastifyReply
    ) {
      const data = {
        id: request.user.superAdminId,
      };

      const promise = getSuperAdminById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);
      if (!ok) {
        const errorObject = {
          statusCode: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.send(errorObject);
      }

      const superAdminId = result.id;

      const accessToken = fastify.jwt.superAdminAccess.sign({
        superAdminId: superAdminId,
      });
      const refreshToken = fastify.jwt.superAdminRefresh.sign({
        superAdminId: superAdminId,
      });

      const accessTokenHash = getSha256Hash(accessToken);
      const refreshTokenHash = getSha256Hash(refreshToken);

      const { set } = createRedisFunctions(fastify.redis);

      const accessTokenKey = getSuperAdminAccessTokenKey(
        superAdminId,
        accessTokenHash
      );
      const refreshTokenKey = getSuperAdminRefreshTokenKey(
        superAdminId,
        refreshTokenHash
      );

      const accessTokenExpiryInSeconds =
        (parse(fastify.config.SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN) ?? 0) / 1000;
      const refreshTokenExpiryInSeconds =
        (parse(fastify.config.SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN) ?? 0) / 1000;

      await set(accessTokenKey, accessToken, accessTokenExpiryInSeconds);
      await set(refreshTokenKey, refreshToken, refreshTokenExpiryInSeconds);

      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'token refreshed successfully.',
        data: {
          ...result,
          password: undefined,
          accessToken: `${superAdminId}:${accessTokenHash}`,
          refreshToken: `${superAdminId}:${refreshTokenHash}`,
        },
      });
    },
  };
}
