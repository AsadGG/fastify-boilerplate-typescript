import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  EmptyResponseSchema,
  ErrorResponseSchema,
} from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { getSuperAdminKeysPattern } from '#utilities/key-helpers';

// #region POST
const superAdminSignOutSchema = {
  operationId: 'superAdminSignOut',
  description: 'this will sign out super admin',
  response: {
    [HTTP_STATUS.OK]: EmptyResponseSchema(
      HTTP_STATUS.OK,
      'signed out successfully.',
    ),
    [HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema(
      HTTP_STATUS.UNAUTHORIZED,
      'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
      'Unauthorized',
      'Authorization token expired',
    ),
  },
  security: [{ AuthorizationSuperAdminAccess: [] }],
  summary: 'sign out super admin',
  tags: ['v1|super admin'],
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest & { user: { superAdminId: string } },
      reply: FastifyReply,
    ) {
      const { superAdminId } = request.user;

      const { del, keys } = fastify.kvStore;

      const pattern = getSuperAdminKeysPattern(superAdminId);

      const superAdminKeys = await keys(pattern);

      await del(superAdminKeys);

      return reply.status(HTTP_STATUS.OK).send({
        message: 'signed out successfully.',
        statusCode: HTTP_STATUS.OK,
      });
    },
    onRequest: [fastify.authenticateSuperAdminAccess],
    schema: superAdminSignOutSchema,
  };
}
// #endregion POST
