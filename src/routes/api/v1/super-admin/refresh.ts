import { getSuperAdminById } from '#repositories/super_admin.repository';
import { ErrorResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { getSha256Hash } from '#utilities/hash';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
} from '#utilities/redis-keys';
import { parse } from '@lukeed/ms';
import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

//#region POST
const AuthenticateUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
      description: 'unique identifier of the user',
    }),
    name: Type.String({
      description: 'full name of the user',
      examples: ['John doe'],
    }),
    email: Type.String({ format: 'email', description: 'email address' }),
    phone: Type.String({
      description: 'phone number',
      examples: ['03001234567'],
    }),
    image: Type.Union([
      Type.Object({
        filename: Type.String({ examples: ['profile-picture.png'] }),
        url: Type.String({ format: 'uri' }),
        mimetype: Type.String({ examples: ['image/png'] }),
        size: Type.Number({ examples: [8192] }),
      }),
      Type.Null(),
    ]),
    accessToken: Type.String({
      description: 'access token used for authentication',
      examples: [
        '01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ],
    }),
    refreshToken: Type.String({
      description: 'refresh token used to obtain new access tokens',
      examples: [
        '01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ],
    }),
  },
  { additionalProperties: false }
);
const superAdminSignInSchema = {
  description: 'this will refresh super admin tokens',
  tags: ['v1|super admin'],
  summary: 'super admin refresh',
  security: [{ AuthorizationSuperAdminRefresh: [] }],
  operationId: 'superAdminRefresh',
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      AuthenticateUserSchema,
      HTTP_STATUS.OK,
      'token refreshed successfully.'
    ),
    [HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
      'Unauthorized',
      'Authorization token expired'
    ),
  },
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
        const statusCode =
          error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.status(statusCode).send(errorObject);
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

      if (result.image) {
        result.image.url = `${fastify.config.WEB_SERVER_BASE_URL}${result.image.url}`;
      }

      return reply.status(HTTP_STATUS.OK).send({
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
//#endregion POST
