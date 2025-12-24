import type { AuthenticatedFastifyRequest } from '#src/types/fastify';
import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  EmptyResponseSchema,
  ErrorResponseSchema,
} from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { createRedisFunctions } from '#utilities/redis-helpers';
import { getUserKeysPattern } from '#utilities/redis-keys';

// #region POST
const userSignOutSchema = {
  operationId: 'userSignOut',
  tags: ['v1|user'],
  summary: 'Sign out user',
  description: 'This will sign out user',
  security: [{ AuthorizationUserAccess: [] }],
  response: {
    [HTTP_STATUS.OK]: EmptyResponseSchema(
      HTTP_STATUS.OK,
      'Signed out successfully.',
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
      const { userId } = request.user;

      const { del, keys } = createRedisFunctions(fastify.redis);

      const pattern = getUserKeysPattern(userId);

      const userKeys = await keys(pattern);

      await del(userKeys);

      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Signed out successfully.',
      });
    },
    onRequest: [fastify.authenticateUserAccess],
    schema: userSignOutSchema,
  };
}
// #endregion POST
