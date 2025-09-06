import { EmptyResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const healthCheckSchema = {
  description: `This route sends a response to the client with a status code of 200 and a message that the server is running.`,
  tags: ['health check'],
  summary: `This route checks the health of the server.`,
  operationId: `healthCheck`,
  response: {
    [HTTP_STATUS.OK]: EmptyResponseSchema(HTTP_STATUS.OK, 'server is running.'),
  },
};
export function GET(_fastify: FastifyInstance) {
  return {
    schema: healthCheckSchema,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      request.log.info({ message: 'server is running.' });
      return reply
        .status(HTTP_STATUS.OK)
        .send({ statusCode: HTTP_STATUS.OK, message: 'server is running.' });
    },
  };
}
