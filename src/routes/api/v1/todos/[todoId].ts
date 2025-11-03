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
const GetSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
const fetchTodoSchema = {
  description: 'this will fetch todo',
  tags: ['v1|todos'],
  summary: 'fetch todo',
  operationId: 'getTodo',
  params: GetSchemaParams,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        task: Type.String(),
        completed: Type.Boolean(),
      }),
      HTTP_STATUS.OK,
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
  },
};
export function GET(fastify: FastifyInstance) {
  return {
    schema: fetchTodoSchema,
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
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
          payload: data,
          error,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo fetched successfully.',
        data: result.record,
      });
    },
  };
}
// #endregion GET

// #region PATCH
const PatchSchemaParams = Type.Object(
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
  description: 'this will update todo',
  tags: ['v1|todos'],
  summary: 'update todo',
  operationId: 'updateTodo',
  params: PatchSchemaParams,
  body: PatchSchemaBody,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        task: Type.String(),
        completed: Type.Boolean(),
      }),
      HTTP_STATUS.OK,
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'record already exists',
    ),
  },
};
export function PATCH(fastify: FastifyInstance) {
  return {
    schema: updateTodoSchema,
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
        Body: Static<typeof PatchSchemaBody>;
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
          payload: data,
          error,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo updated successfully.',
        data: result.record,
      });
    },
  };
}
// #endregion PATCH

// #region DELETE
const DeleteSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);

const deleteTodoSchema = {
  description: 'this will delete todo',
  tags: ['v1|todos'],
  summary: 'delete todo',
  operationId: 'deleteTodo',
  params: DeleteSchemaParams,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      HTTP_STATUS.OK,
      'record deleted successfully.',
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
  },
};
export function DELETE(fastify: FastifyInstance) {
  return {
    schema: deleteTodoSchema,
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
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
          payload: data,
          error,
        });
        return reply.status(statusCode).send(errorObject);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'todo deleted successfully.',
        data: result.record,
      });
    },
  };
}
// #endregion DELETE
