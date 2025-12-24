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
import { sendError } from '#utilities/send-error';
import { Type } from '@sinclair/typebox';

// #region GET
const GetSchemaQuerystring = Type.Composite(
  [PaginationQuerySchema, SearchQuerySchema],
  { additionalProperties: false },
);
const fetchTodosSchema = {
  operationId: 'getTodos',
  tags: ['v1|todos'],
  summary: 'Fetch todos',
  description: 'This will fetch todos',
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todos fetched successfully.',
        data: result.records,
        pagination: result.pagination,
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
  tags: ['v1|todos'],
  summary: 'Create todo',
  description: 'This will create todo',
  body: PostSchemaBody,
  response: {
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'Record already exists',
    ),
    [HTTP_STATUS.CREATED]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean(),
        task: Type.String(),
      }),
      HTTP_STATUS.CREATED,
      'Record created successfully.',
    ),
  },
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.CREATED).send({
        statusCode: HTTP_STATUS.CREATED,
        message: 'Todo created successfully.',
        data: result.record,
      });
    },
    schema: createTodosSchema,
  };
}
// #endregion POST
