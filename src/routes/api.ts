import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const healthCheckSchema = {
  description: `This route sends a response to the client with a status code of 200 and a message that the server is running.`,
  tags: ['health check'],
  summary: `This route checks the health of the server.`,
  operationId: `healthCheck`,
};
export function GET(_fastify: FastifyInstance) {
  return {
    schema: healthCheckSchema,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      request.log.info({ message: `Server Is Running` });
      return reply.status(200).send({ health: `Server Is Running` });
    },
  };
}
