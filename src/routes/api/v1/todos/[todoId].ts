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
import { sendError } from '#utilities/send-error';
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
  tags: ['v1|todos'],
  summary: 'Fetch todo',
  description: 'This will fetch todo',
  params: GetSchemaParameters,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'Record does not exist',
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todo fetched successfully.',
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
  tags: ['v1|todos'],
  summary: 'Update todo',
  description: 'This will update todo',
  params: PatchSchemaParameters,
  body: PatchSchemaBody,
  response: {
    [HTTP_STATUS.CONFLICT]: EmptyResponseSchema(
      HTTP_STATUS.CONFLICT,
      'Record already exists',
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'Record does not exist',
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todo updated successfully.',
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
  tags: ['v1|todos'],
  summary: 'Delete todo',
  description: 'This will delete todo',
  params: DeleteSchemaParameters,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'Record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      HTTP_STATUS.OK,
      'Record deleted successfully.',
    ),
  },
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todo deleted successfully.',
        data: result.record,
      });
    },
    schema: deleteTodoSchema,
  };
}
// #endregion DELETE
