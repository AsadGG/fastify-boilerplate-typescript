import {
  EmptyResponseSchema,
  ErrorResponseSchema,
} from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { createRedisFunctions } from '#utilities/redis-helpers';
import { getSuperAdminKeysPattern } from '#utilities/redis-keys';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

//#region POST
const superAdminSignOutSchema = {
  description: 'this will sign out super admin',
  tags: ['v1|super admin'],
  summary: 'sign out super admin',
  security: [{ AuthorizationSuperAdminAccess: [] }],
  operationId: 'superAdminSignOut',
  response: {
    [HTTP_STATUS.OK]: EmptyResponseSchema(
      HTTP_STATUS.OK,
      'signed out successfully.'
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
    schema: superAdminSignOutSchema,
    onRequest: [fastify.authenticateSuperAdminAccess],
    handler: async function (
      request: FastifyRequest & { user: { superAdminId: string } },
      reply: FastifyReply
    ) {
      const { superAdminId } = request.user;

      const { keys, del } = createRedisFunctions(fastify.redis);

      const pattern = getSuperAdminKeysPattern(superAdminId);

      const superAdminKeys = await keys(pattern);

      await del(superAdminKeys);

      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'signed out successfully.',
      });
    },
  };
}
//#endregion POST
