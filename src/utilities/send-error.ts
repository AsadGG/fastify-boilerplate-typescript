import type { FastifyError } from '@fastify/error';
import type { FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from './http-status-codes';

export function sendError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: FastifyError,
  payload?: unknown,
) {
  const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  request.log.error({ error, payload });

  return reply.status(statusCode).send(error);
}
