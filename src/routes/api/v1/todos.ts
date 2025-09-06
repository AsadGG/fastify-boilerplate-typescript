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
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

//#region GET
const GetSchemaQuerystring = Type.Composite(
  [PaginationQuerySchema, SearchQuerySchema],
  { additionalProperties: false }
);
const fetchTodosSchema = {
  description: 'this will fetch todos',
  tags: ['v1|todos'],
  summary: 'fetch todos',
  operationId: 'getTodos',
  querystring: GetSchemaQuerystring,
  response: {
    [HTTP_STATUS.OK]: PaginatedResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        task: Type.String(),
        completed: Type.Boolean(),
      }),
      HTTP_STATUS.OK
    ),
  },
};
export function GET(fastify: FastifyInstance) {
  return {
    schema: fetchTodosSchema,
    handler: async function (
      request: FastifyRequest<{
        Querystring: Static<typeof GetSchemaQuerystring>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        page: request.query.page,
        size: request.query.size,
        search: request.query.search,
      };

      const promise = getTodos(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode =
          error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todos fetched successfully.',
        data: result.records,
        pagination: result.pagination,
      });
    },
  };
}
//#endregion GET

//#region POST
const PostSchemaBody = Type.Object(
  {
    task: Type.String(),
  },
  { additionalProperties: false }
);
const createTodosSchema = {
  description: 'this will create todo',
  tags: ['v1|todos'],
  summary: 'create todo',
  operationId: 'createTodo',
  body: PostSchemaBody,
  response: {
    [HTTP_STATUS.CREATED]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        task: Type.String(),
        completed: Type.Boolean(),
      }),
      HTTP_STATUS.CREATED,
      'record created successfully.'
    ),
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'record already exists'
    ),
  },
};
export function POST(fastify: FastifyInstance) {
  return {
    schema: createTodosSchema,
    handler: async function (
      request: FastifyRequest<{
        Body: Static<typeof PostSchemaBody>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        task: request.body.task,
      };

      const promise = createTodo(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode =
          error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.CREATED).send({
        statusCode: HTTP_STATUS.CREATED,
        message: 'todo created successfully.',
        data: result.record,
      });
    },
  };
}
//#endregion POST
