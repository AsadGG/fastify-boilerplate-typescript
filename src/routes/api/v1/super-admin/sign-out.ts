import HTTP_STATUS from '#utilities/http-status';
import { createRedisFunctions } from '#utilities/redis-helpers';
import { getSuperAdminKeysPattern } from '#utilities/redis-keys';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const superAdminSignOutSchema = {
  description: 'this will sign out super admin',
  tags: ['v1|super admin'],
  summary: 'sign out super admin',
  security: [{ AuthorizationSuperAdminAccess: [] }],
  operationId: 'superAdminSignOut',
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

      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'signed out successfully.',
      });
    },
  };
}
