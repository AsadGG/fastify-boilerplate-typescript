import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSuperAdminById } from '#repositories/super_admin.repository';
import { ErrorResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { getSha256Hash } from '#utilities/hash';
import HTTP_STATUS from '#utilities/http-status-codes';
import {
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
} from '#utilities/key-helpers';
import { promiseHandler } from '#utilities/promise-handler';
import { parse } from '@lukeed/ms';
import { Type } from '@sinclair/typebox';

// #region POST
const AuthenticateUserSchema = Type.Object(
  {
    id: Type.String({
      description: 'unique identifier of the user',
      format: 'uuid',
    }),
    email: Type.String({ description: 'email address', format: 'email' }),
    image: Type.Union([
      Type.Object({
        filename: Type.String({ examples: ['profile-picture.png'] }),
        mimetype: Type.String({ examples: ['image/png'] }),
        size: Type.Number({ examples: [8192] }),
        url: Type.String({ format: 'uri' }),
      }),
      Type.Null(),
    ]),
    name: Type.String({
      description: 'full name of the user',
      examples: ['John doe'],
    }),
    phone: Type.String({
      description: 'phone number',
      examples: ['03001234567'],
    }),
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
  { additionalProperties: false },
);
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

      const { set } = fastify.kvStore;

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
