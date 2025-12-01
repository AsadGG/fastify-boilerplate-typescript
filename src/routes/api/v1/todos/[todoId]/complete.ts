import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { updateTodoCompletionById } from '#repositories/todo.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Type } from '@sinclair/typebox';

// #region PATCH
const PatchSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
const completeTodoSchema = {
  operationId: 'completeTodo',
  description: 'this will mark todo as complete',
  params: PatchSchemaParams,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean({ examples: [true] }),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
      'record marked as complete',
    ),
  },
  summary: 'mark todo as complete',
  tags: ['v1|todos'],
};
export function PATCH(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof PatchSchemaParams>;
      }>,
      reply: FastifyReply,
    ) {
      const data = {
        todoId: request.params.todoId,
        completed: true,
      };

      const promise = updateTodoCompletionById(fastify.kysely, data);
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
        data: result.record,
        message: 'todo marked as complete successfully.',
        statusCode: HTTP_STATUS.OK,
      });
    },
    schema: completeTodoSchema,
  };
}
// #endregion PATCH
