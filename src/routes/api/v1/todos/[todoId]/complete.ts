import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { updateTodoCompletionById } from '#repositories/todo.repository';
import { EmptyResponseSchema, ResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { sendError } from '#utilities/send-error';
import { Type } from '@sinclair/typebox';

// #region PATCH
const PatchSchemaParameters = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false },
);
const completeTodoSchema = {
  operationId: 'completeTodo',
  tags: ['v1|todos'],
  summary: 'Mark todo as complete',
  description: 'This will mark todo as complete',
  params: PatchSchemaParameters,
  response: {
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'Record does not exist',
    ),
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean({ examples: [true] }),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
      'Record marked as complete',
    ),
  },
};
export function PATCH(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Params: Static<typeof PatchSchemaParameters>;
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
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todo marked as complete successfully.',
        data: result.record,
      });
    },
    schema: completeTodoSchema,
  };
}
// #endregion PATCH
