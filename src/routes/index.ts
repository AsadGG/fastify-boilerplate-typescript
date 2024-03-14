'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import schema from './_schema.js';

export function GET(_fastify: FastifyInstance) {
  return {
    schema: schema.HEALTH.GET,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      request.log.info({ message: `Server Is Running` });
      return reply.status(200).send({ health: `Server Is Running` });
    },
  };
}
