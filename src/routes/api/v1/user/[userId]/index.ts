'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from '../../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../../utilities/promise-handler.js';
import model from './_model.js';
import schema from './_schema.js';

export function GET(fastify: FastifyInstance) {
  return {
    schema: schema.USER_ID.GET,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.USER_ID.GET(fastify.knex, data);
      const [result, error] = await promiseHandler(promise);
      if (!result) {
        if (!error) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: 'user does not exist.',
          });
        }
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error?.detail ?? error.message,
        });
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'user fetched successfully.',
        data: result,
      });
    },
  };
}

export function PATCH(fastify: FastifyInstance) {
  return {
    schema: schema.USER_ID.PATCH,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.USER_ID.PATCH(fastify.knex, data);
      const [result, error] = await promiseHandler(promise);
      if (!result) {
        if (!error) {
          return reply.status(HTTP_STATUS.NOT_FOUND).send({
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: 'user does not exist.',
          });
        }
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'user has been updated.',
        data: result,
      });
    },
  };
}

export function DELETE(fastify: FastifyInstance) {
  return {
    schema: schema.USER_ID.DELETE,
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      const data = {
        params: request.params,
        query: request.query,
        body: request.body,
        user: request.user,
      };
      const promise = model.USER_ID.DELETE(fastify.knex, data);
      const [result, error] = await promiseHandler(promise);
      if (result === null) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }
      if (result === 0) {
        return reply.status(HTTP_STATUS.OK).send({
          statusCode: HTTP_STATUS.OK,
          message: 'user does not exist.',
        });
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'user deleted successfully.',
      });
    },
  };
}
