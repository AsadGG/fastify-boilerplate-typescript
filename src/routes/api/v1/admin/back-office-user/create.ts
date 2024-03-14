'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from '../../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../../utilities/promise-handler.js';
import model from './_model.js';
import schema, { CreatePostBodyType } from './_schema.js';

export function POST(fastify: FastifyInstance) {
  return {
    schema: schema.CREATE.POST,
    handler: async function (
      request: FastifyRequest<{
        Body: CreatePostBodyType;
      }>,
      reply: FastifyReply
    ) {
      {
        const data = {
          params: request.params,
          query: request.query,
          body: request.body,
          user: request.user,
        };
        const promise = model.CREATE.POST(fastify.knex, data);
        const [result, error] = await promiseHandler(promise);
        if (!result) {
          request.log.error(error);
          return reply.status(HTTP_STATUS.BAD_REQUEST).send({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: error?.detail ?? error.message,
          });
        }

        return reply.status(HTTP_STATUS.OK).send({
          statusCode: HTTP_STATUS.OK,
          message: 'user has been successfully created.',
          data: result,
        });
      }
    },
  };
}
