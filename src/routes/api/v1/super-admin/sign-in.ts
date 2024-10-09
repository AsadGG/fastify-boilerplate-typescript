import { Type } from '@sinclair/typebox';

const superAdminSignInSchema = {
  description: 'this will sign in super admin',
  tags: ['v1|super admin'],
  summary: 'sign in super admin',
  operationId: 'superAdminSignIn',
  body: Type.Object(
    {
      email: Type.String({ format: 'email' }),
      password: Type.String({ minLength: 8 }),
    },
    { additionalProperties: false }
  ),
};
export function POST(fastify) {
  return {
    schema: superAdminSignInSchema,
    handler: async function (request, reply) {
      const data = {
        ...request.body,
      };
      const promise = getSuperAdminByEmail(fastify.knex, data);
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

      const isPasswordMatch = await fastify.bcrypt.compare(
        request.body.password,
        result.password
      );

      if (!isPasswordMatch) {
        const errorObject = {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: `invalid credentials`,
        };
        request.log.error({
          ...errorObject,
          payload: data,
        });
        return reply.send(errorObject);
      }

      delete result.password;

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
        parse(fastify.config.SUPER_ADMIN_ACCESS_JWT_EXPIRES_IN) / 1000;
      const refreshTokenExpiryInSeconds =
        parse(fastify.config.SUPER_ADMIN_REFRESH_JWT_EXPIRES_IN) / 1000;

      await set(accessTokenKey, accessToken, accessTokenExpiryInSeconds);
      await set(refreshTokenKey, refreshToken, refreshTokenExpiryInSeconds);

      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'signed in successfully.',
        data: {
          ...result,
          accessToken: `${superAdminId}:${accessTokenHash}`,
          refreshToken: `${superAdminId}:${refreshTokenHash}`,
        },
      });
    },
  };
}
