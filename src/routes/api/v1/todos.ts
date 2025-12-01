import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createTodo, getTodos } from '#repositories/todo.repository';
import {
  EmptyResponseSchema,
  PaginatedResponseSchema,
  PaginationQuerySchema,
  ResponseSchema,
  SearchQuerySchema,
} from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Type } from '@sinclair/typebox';

// #region GET
const GetSchemaQuerystring = Type.Composite(
  [PaginationQuerySchema, SearchQuerySchema],
  { additionalProperties: false },
);
const fetchTodosSchema = {
  operationId: 'getTodos',
  description: 'this will fetch todos',
  querystring: GetSchemaQuerystring,
  response: {
    [HTTP_STATUS.OK]: PaginatedResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean(),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
    ),
  },
  summary: 'fetch todos',
  tags: ['v1|todos'],
};
export function GET(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Querystring: Static<typeof GetSchemaQuerystring>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        page: request.query.page,
        search: request.query.search,
        size: request.query.size,
      };

      const promise = getTodos(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          message: error.message,
          statusCode,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        data: result.records,
        message: 'todos fetched successfully.',
        pagination: result.pagination,
        statusCode: HTTP_STATUS.OK,
      });
    },
    schema: fetchTodosSchema,
  };
}
// #endregion GET

// #region POST
const PostSchemaBody = Type.Object(
  {
    task: Type.String(),
  },
  { additionalProperties: false },
);
const createTodosSchema = {
  operationId: 'createTodo',
  body: PostSchemaBody,
  description: 'this will create todo',
  response: {
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'record already exists',
    ),
    [HTTP_STATUS.CREATED]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean(),
        task: Type.String(),
      }),
      HTTP_STATUS.CREATED,
      'record created successfully.',
    ),
  },
  summary: 'create todo',
  tags: ['v1|todos'],
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Body: Static<typeof PostSchemaBody>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        task: request.body.task,
      };

      const promise = createTodo(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          message: error.message,
          statusCode,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.CREATED).send({
        data: result.record,
        message: 'todo created successfully.',
        statusCode: HTTP_STATUS.CREATED,
      });
    },
    schema: createTodosSchema,
  };
}
// #endregion POST
