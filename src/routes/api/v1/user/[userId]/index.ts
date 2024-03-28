'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import HTTP_STATUS from '../../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../../utilities/promise-handler.js';
import schema, {
  UserIdDeleteParamsType,
  UserIdGetParamsType,
  UserIdPatchBodyType,
  UserIdPatchParamsType,
} from './_schema.js';

export function GET(fastify: FastifyInstance) {
  return {
    schema: schema.USER_ID.GET,
    handler: async function (
      request: FastifyRequest<{
        Params: UserIdGetParamsType;
      }>,
      reply: FastifyReply
    ) {
      const promise = fastify.kysely
        .selectFrom('user')
        .selectAll()
        .where('id', '=', request.params.userId)
        .executeTakeFirst();

      const [result, error, ok] = await promiseHandler(promise);

      if (!ok) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error?.detail ?? error.message,
        });
      }

      if (!result) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'user does not exist.',
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
    handler: async function (
      request: FastifyRequest<{
        Body: UserIdPatchBodyType;
        Params: UserIdPatchParamsType;
      }>,
      reply: FastifyReply
    ) {
      const promise = fastify.kysely
        .updateTable('user')
        .set({
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          email: request.body.email,
          amount: request.body.amount,
          phone: request.body.phone,
          roleId: request.body.roleId,
        })
        .where('id', '=', request.params.userId)
        .returningAll()
        .executeTakeFirst();

      const [result, error, ok] = await promiseHandler(promise);

      if (!ok) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }

      if (!result) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'user does not exist.',
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
    handler: async function (
      request: FastifyRequest<{
        Params: UserIdDeleteParamsType;
      }>,
      reply: FastifyReply
    ) {
      const promise = fastify.kysely
        .deleteFrom('user')
        .where('id', '=', request.params.userId)
        .executeTakeFirst();

      const [result, error, ok] = await promiseHandler(promise);
      if (!ok) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }

      const { numDeletedRows } = result;

      if (parseInt(numDeletedRows.toString()) === 0) {
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
