import { createTodo, getTodos } from '#repositories/todo.repository';
import HTTP_STATUS from '#utilities/http-status';
import { promiseHandler } from '#utilities/promise-handler';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const GetSchemaQuerystring = Type.Object(
  {
    page: Type.Integer({ default: 1, minimum: 1 }),
    size: Type.Integer({ default: 10, minimum: 10 }),
    search: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);
const fetchTodosSchema = {
  description: 'this will fetch todos',
  tags: ['v1|todos'],
  summary: 'fetch todos',
  operationId: 'getTodos',
  querystring: GetSchemaQuerystring,
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
        const errorObject = {
          statusCode: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.send(errorObject);
      }
      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'todos fetched successfully.',
        data: result.records,
        pagination: result.pagination,
      });
    },
  };
}

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
        const errorObject = {
          statusCode: error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.send(errorObject);
      }
      return reply.send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo created successfully.',
        data: result.record,
      });
    },
  };
}
