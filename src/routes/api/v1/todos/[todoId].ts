import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  deleteTodoById,
  getTodoById,
  updateTodoById,
} from '#repositories/todo.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Type } from '@sinclair/typebox';

// #region GET
const GetSchemaParameters = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
const fetchTodoSchema = {
  operationId: 'getTodo',
  description: 'this will fetch todo',
  params: GetSchemaParameters,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean(),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
    ),
  },
  summary: 'fetch todo',
  tags: ['v1|todos'],
};
export function GET(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParameters>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        todoId: request.params.todoId,
      };

      const promise = getTodoById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo fetched successfully.',
        data: result.record,
      });
    },
    schema: fetchTodoSchema,
  };
}
// #endregion GET

// #region PATCH
const PatchSchemaParameters = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
const PatchSchemaBody = Type.Object(
  {
    task: Type.String(),
  },
  { additionalProperties: false },
);
const updateTodoSchema = {
  operationId: 'updateTodo',
  body: PatchSchemaBody,
  description: 'this will update todo',
  params: PatchSchemaParameters,
  response: {
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'record already exists',
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean(),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
    ),
  },
  summary: 'update todo',
  tags: ['v1|todos'],
};
export function PATCH(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Body: Static<typeof PatchSchemaBody>;
        Params: Static<typeof GetSchemaParameters>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        todoId: request.params.todoId,
        task: request.body.task,
      };

      const promise = updateTodoById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo updated successfully.',
        data: result.record,
      });
    },
    schema: updateTodoSchema,
  };
}
// #endregion PATCH

// #region DELETE
const DeleteSchemaParameters = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);

const deleteTodoSchema = {
  operationId: 'deleteTodo',
  description: 'this will delete todo',
  params: DeleteSchemaParameters,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      HTTP_STATUS.OK,
      'record deleted successfully.',
    ),
  },
  summary: 'delete todo',
  tags: ['v1|todos'],
};
export function DELETE(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParameters>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        todoId: request.params.todoId,
      };

      const promise = deleteTodoById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo deleted successfully.',
        data: result.record,
      });
    },
    schema: deleteTodoSchema,
  };
}
// #endregion DELETE
