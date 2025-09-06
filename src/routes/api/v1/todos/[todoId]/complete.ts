import { updateTodoCompletionById } from '#repositories/todo.repository';
import { ResponseSchema, EmptyResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

//#region PATCH
const PatchSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false }
);
const completeTodoSchema = {
  description: 'this will mark todo as complete',
  tags: ['v1|todos'],
  summary: 'mark todo as complete',
  operationId: 'completeTodo',
  params: PatchSchemaParams,
  response: {
    [HTTP_STATUS.OK]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        task: Type.String(),
        completed: Type.Boolean({ examples: [true] }),
      }),
      HTTP_STATUS.OK,
      'record marked as complete'
    ),
    [HTTP_STATUS.NOT_FOUND]: EmptyResponseSchema(
      HTTP_STATUS.NOT_FOUND,
      'record does not exist'
    ),
  },
};
export function PATCH(fastify: FastifyInstance) {
  return {
    schema: completeTodoSchema,
    handler: async function (
      request: FastifyRequest<{
        Params: Static<typeof PatchSchemaParams>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        todoId: request.params.todoId,
        completed: true,
      };

      const promise = updateTodoCompletionById(fastify.kysely, data);
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
        message: 'todo marked as complete successfully.',
        data: result.record,
      });
    },
  };
}
//#endregion PATCH
