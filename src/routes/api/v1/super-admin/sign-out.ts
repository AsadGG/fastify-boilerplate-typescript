const superAdminSignOutSchema = {
  description: 'this will sign out super admin',
  tags: ['v1|super admin'],
  summary: 'sign out super admin',
  security: [{ AuthorizationSuperAdminAccess: [] }],
  operationId: 'superAdminSignOut',
};
export function POST(fastify) {
  return {
    schema: superAdminSignOutSchema,
    onRequest: [fastify.authenticateSuperAdminAccess],
    handler: async function (request, reply) {
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
