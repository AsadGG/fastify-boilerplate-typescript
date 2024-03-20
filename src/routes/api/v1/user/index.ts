'use strict';

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ExpressionBuilder, ExpressionWrapper, SqlBool } from 'kysely';
import { DB } from 'kysely-codegen';
import HTTP_STATUS from '../../../../utilities/http-status.js';
import { promiseHandler } from '../../../../utilities/promise-handler.js';
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
      const limit = request.query.size;
      const offset = request.query.page * limit;

      function searchFilter(
        searchText: string
      ): (
        eb: ExpressionBuilder<DB, 'users'>
      ) => ExpressionWrapper<DB, 'users', SqlBool> {
        return function (eb: ExpressionBuilder<DB, 'users'>) {
          return eb.or([
            eb('firstName', 'ilike', `%${searchText}%`),
            eb('lastName', 'ilike', `%${searchText}%`),
            eb('email', 'ilike', `%${searchText}%`),
            eb('phone', 'ilike', `%${searchText}%`),
          ]);
        };
      }

      let usersQuery = fastify.kysely
        .selectFrom('users')
        .selectAll()
        .limit(limit)
        .offset(offset);

      const searchText = request.query.search;

      if (searchText) {
        usersQuery = usersQuery.where(searchFilter(searchText));
      }

      const userPromise = usersQuery.execute();

      let usersCountQuery = fastify.kysely
        .selectFrom('users')
        .select((eb) => eb.fn.countAll().as('count'));

      if (searchText) {
        usersCountQuery = usersCountQuery.where(searchFilter(searchText));
      }

      const usersCountPromise = usersCountQuery.execute();

      const promise = Promise.all([userPromise, usersCountPromise]);

      const [result, error, ok] = await promiseHandler(promise);

      if (!ok) {
        request.log.error(error);
        return reply.status(HTTP_STATUS.BAD_REQUEST).send({
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: error.detail ?? error.message,
        });
      }

      const [records, [{ count: totalRecordCount }]] = result;
      let currentPage = 0;
      if (Number(totalRecordCount) > 0) {
        currentPage = Math.ceil(offset / limit);
      }
      const totalRecords = Number(totalRecordCount);
      const totalPages = Math.ceil(totalRecords / limit);
      const prevPage = currentPage !== 0 ? currentPage - 1 : null;
      const nextPage = currentPage < totalPages - 1 ? currentPage + 1 : null;
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'users fetched successfully.',
        data: records,
        pagination: {
          totalRecords,
          currentPage,
          totalPages,
          prevPage,
          nextPage,
        },
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

      const promise = fastify.kysely
        .insertInto('users')
        .values(request.body)
        .returningAll()
        .execute();

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
