import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSuperAdminByEmail } from '#repositories/super_admin.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
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
const PostSchemaBody = Type.Object(
  {
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
  },
  { additionalProperties: false },
);
const superAdminSignInSchema = {
  operationId: 'superAdminSignIn',
  body: PostSchemaBody,
  description: 'this will sign in super admin',
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      AuthenticateUserSchema,
      HTTP_STATUS.OK,
      'signed in successfully.',
    ),
    [HTTP_STATUS.UNAUTHORIZED]: EmptyResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'invalid credentials.',
    ),
  },
  summary: 'sign in super admin',
  tags: ['v1|super admin'],
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
      const promise = getSuperAdminByEmail(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);
      if (!ok) {
        const statusCode
          = error.statusCode === HTTP_STATUS.NOT_FOUND
            ? HTTP_STATUS.UNAUTHORIZED
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          message:
            error.statusCode === HTTP_STATUS.NOT_FOUND
              ? `invalid credentials.`
              : `something went wrong.`,
          statusCode,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }

      const isPasswordMatch = await fastify.bcrypt.compare(
        request.body.password,
        result.password,
      );

      if (!isPasswordMatch) {
        const errorObject = {
          message: `invalid credentials.`,
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(HTTP_STATUS.UNAUTHORIZED).send(errorObject);
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
        message: 'signed in successfully.',
        statusCode: HTTP_STATUS.OK,
      });
    },
    schema: superAdminSignInSchema,
  };
}
// #endregion POST
