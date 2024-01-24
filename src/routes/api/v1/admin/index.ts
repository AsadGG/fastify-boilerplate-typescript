import { FastifyInstance } from 'fastify';
import { adminLogger } from '../../../../config/logger.js';
import { helloAdminSchema } from './schema.js';

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', function (request, reply, done) {
    request.log = adminLogger;
    request.log.info({ request: request.raw, reply: reply.raw });
    done();
  });

  fastify.get(
    '/',
    { schema: helloAdminSchema },
    async function (request, reply) {
      request.log.info(`Handling GET ${request.url} request`);
      return reply
        .status(200)
        .send({ statusCode: 200, message: `Hello Admin` });
    }
  );
}
