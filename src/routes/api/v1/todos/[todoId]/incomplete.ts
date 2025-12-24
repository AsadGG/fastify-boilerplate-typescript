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
const incompleteTodoSchema = {
  operationId: 'incompleteTodo',
  tags: ['v1|todos'],
  summary: 'Mark todo as incomplete',
  description: 'This will mark todo as incomplete',
  params: PatchSchemaParameters,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        completed: Type.Boolean({ examples: [false] }),
        task: Type.String(),
      }),
      HTTP_STATUS.OK,
      'Record marked as incomplete',
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'Record does not exist',
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
        completed: false,
      };

      const promise = updateTodoCompletionById(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        return sendError(request, reply, error, data);
      }
      return reply.status(HTTP_STATUS.OK).send({
        statusCode: HTTP_STATUS.OK,
        message: 'Todo marked as incomplete successfully.',
        data: result.record,
      });
    },
    schema: incompleteTodoSchema,
  };
}
// #endregion PATCH
