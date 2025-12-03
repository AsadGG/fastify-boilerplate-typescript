import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getSuperAdminByEmail } from '#repositories/super_admin.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
import { AuthenticateUserSchema } from '#schemas/user.schema';
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
          statusCode,
          message:
            error.statusCode === HTTP_STATUS.NOT_FOUND
              ? `invalid credentials.`
              : `something went wrong.`,
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
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: `invalid credentials.`,
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
        statusCode: HTTP_STATUS.OK,
        message: 'signed in successfully.',
        data: {
          ...result,
          password: undefined,
          accessToken: `${superAdminId}:${accessTokenHash}`,
          refreshToken: `${superAdminId}:${refreshTokenHash}`,
        },
      });
    },
    schema: superAdminSignInSchema,
  };
}
// #endregion POST
