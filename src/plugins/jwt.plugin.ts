'use strict';

import fastifyJWT from '@fastify/jwt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

async function myFastifyJWT(fastify: FastifyInstance, opts: any) {
  await fastify.register(fastifyJWT, opts);
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
}

export default fastifyPlugin(myFastifyJWT);
