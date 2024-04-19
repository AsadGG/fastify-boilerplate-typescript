'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from '../../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../../utilities/promise-handler.js';
import model from './_model.js';
import schema, { LoginPostBodyType } from './_schema.js';

export function POST(fastify: FastifyInstance) {
  return {
    schema: schema.LOGIN.POST,
    handler: async function (
      request: FastifyRequest<{
        Body: LoginPostBodyType;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.LOGIN.POST(fastify.knex, data);
      const [result, error, ok] = await promiseHandler(promise);
      if (!ok) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error?.detail ?? error.message,
        });
      }
      const token = fastify.jwt.sign({ id: result.id, email: result.email });
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'successfully login',
        data: {
          token,
          ...result,
        },
      });
    },
  };
}
