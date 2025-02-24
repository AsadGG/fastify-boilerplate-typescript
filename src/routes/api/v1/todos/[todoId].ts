import {
  deleteTodoById,
  getTodoById,
  updateTodoById,
} from '#repositories/todo.repository';
import HTTP_STATUS from '#utilities/http-status';
import { promiseHandler } from '#utilities/promise-handler';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const GetSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false }
);

const fetchTodoSchema = {
  description: 'this will fetch todo',
  tags: ['v1|todos'],
  summary: 'fetch todo',
  operationId: 'getTodo',
  params: GetSchemaParams,
};
export function GET(fastify: FastifyInstance) {
  return {
    schema: fetchTodoSchema,
    handler: async function (
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        todoId: request.params.todoId,
      };

      const promise = getTodoById(fastify.kysely, data);
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
        message: 'todo fetched successfully.',
        data: result.record,
      });
    },
  };
}

const PatchSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false }
);
const PatchSchemaBody = Type.Object(
  {
    task: Type.String(),
  },
  { additionalProperties: false }
);
const updateTodoSchema = {
  description: 'this will update todo',
  tags: ['v1|todos'],
  summary: 'update todo',
  operationId: 'updateTodo',
  params: PatchSchemaParams,
  body: PatchSchemaBody,
};
export function PATCH(fastify: FastifyInstance) {
  return {
    schema: updateTodoSchema,
    handler: async function (
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
        Body: Static<typeof PatchSchemaBody>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        todoId: request.params.todoId,
        task: request.body.task,
      };

      const promise = updateTodoById(fastify.kysely, data);
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
        message: 'todo updated successfully.',
        data: result.record,
      });
    },
  };
}

const DeleteSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false }
);

const deleteTodoSchema = {
  description: 'this will delete todo',
  tags: ['v1|todos'],
  summary: 'delete todo',
  operationId: 'deleteTodo',
  params: DeleteSchemaParams,
};
export function DELETE(fastify: FastifyInstance) {
  return {
    schema: deleteTodoSchema,
    handler: async function (
      request: FastifyRequest<{
        Params: Static<typeof GetSchemaParams>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        todoId: request.params.todoId,
      };

      const promise = deleteTodoById(fastify.kysely, data);
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
        message: 'todo deleted successfully.',
        data: result.record,
      });
    },
  };
}
