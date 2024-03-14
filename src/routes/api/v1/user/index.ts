'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from '../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../utilities/promise-handler.js';
import model from './_model.js';
import schema, {
  type UserGetQueryStringType,
  type UserPostBodyType,
} from './_schema.js';

export function GET(fastify: FastifyInstance) {
  return {
    schema: schema.USER.GET,
    handler: async function (
      request: FastifyRequest<{
        Querystring: UserGetQueryStringType;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.USER.GET(fastify.knex, data);
      const [result, error] = await promiseHandler(promise);
      if (!result) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'users fetched successfully.',
        data: result,
      });
    },
  };
}

export function POST(fastify: FastifyInstance) {
  return {
    schema: schema.USER.POST,
    handler: async function (
      request: FastifyRequest<{ Body: UserPostBodyType }>,
      reply: FastifyReply
    ) {
      const password = request.body.password;
      const hashedPassword = await fastify.bcrypt.hash(password);
      request.body.password = hashedPassword;
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.USER.POST(fastify.knex, data);
      const [result, error] = await promiseHandler(promise);
      if (!result) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }

      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'User has been successfully created.',
        data: result,
      });
    },
  };
}
