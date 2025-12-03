import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { EmptyResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';

// #region GET
const healthCheckSchema = {
  operationId: `healthCheck`,
  description: `This route sends a response to the client with a status code of 200 and a message that the server is running.`,
  response: {
    [HTTP_STATUS.OK]: EmptyResponseSchema(HTTP_STATUS.OK, 'server is running.'),
  },
  summary: `This route checks the health of the server.`,
  tags: ['health check'],
};
export function GET(_fastify: FastifyInstance) {
  return {
    async handler(request: FastifyRequest, reply: FastifyReply) {
      request.log.info({ message: 'server is running.' });
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'server is running.',
      });
    },
    schema: healthCheckSchema,
  };
}
// #endregion GET
