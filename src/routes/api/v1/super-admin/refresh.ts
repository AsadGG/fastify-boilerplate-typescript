import { JWT } from '@fastify/jwt';
import { parse } from '@lukeed/ms';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSha256Hash } from '../../../../utilities/hash.js';
import HTTP_STATUS from '../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../utilities/promise-handler.js';
import { createRedisFunctions } from '../../../../utilities/redis-helpers.js';
import {
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
} from '../../../../utilities/redis-keys.js';

const superAdminSignInSchema = {
  description: 'this will refresh super admin tokens',
  tags: ['v1|super admin'],
  summary: 'super admin refresh',
  security: [{ AuthorizationSuperAdminRefresh: [] }],
  operationId: 'superAdminRefresh',
};
export function POST(
  fastify: FastifyInstance & { authenticateSuperAdminRefresh: () => null }
) {
  return {
    schema: superAdminSignInSchema,
    onRequest: [fastify.authenticateSuperAdminRefresh],
    handler: async function (
      request: FastifyRequest & { user: { superAdminId: string } },
      reply: FastifyReply
    ) {
      const data = {
        superAdminId: request.user.superAdminId,
      };

      const promise = getSuperAdminById(fastify.knex, data);
      const [result, error, ok] = await promiseHandler(promise);
      if (!ok) {
        const errorObject = {
          statusCode: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error.detail ?? error.message,
        };
        request.log.error({
          ...errorObject,
          payload: data,
        });
        return reply.send(errorObject);
      }

      const superAdminId = result.id;

      const jwt = fastify.jwt as unknown as {
        superAdminAccess: JWT;
        superAdminRefresh: JWT;
      };

      const accessToken = jwt.superAdminAccess.sign({
        superAdminId: superAdminId,
      });
      const refreshToken = jwt.superAdminRefresh.sign({
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
        parse(fastify.config.SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN) ?? 0 / 1000;
      const refreshTokenExpiryInSeconds =
        parse(fastify.config.SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN) ?? 0 / 1000;

      await set(accessTokenKey, accessToken, accessTokenExpiryInSeconds);
      await set(refreshTokenKey, refreshToken, refreshTokenExpiryInSeconds);

      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'token refreshed successfully.',
        data: {
          ...result,
          accessToken: `${superAdminId}:${accessTokenHash}`,
          refreshToken: `${superAdminId}:${refreshTokenHash}`,
        },
      });
    },
  };
}
