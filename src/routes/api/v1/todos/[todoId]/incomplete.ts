import { updateTodoCompletionById } from '#repositories/todo.repository';
import HTTP_STATUS from '#utilities/http-status';
import { promiseHandler } from '#utilities/promise-handler';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const PatchSchemaParams = Type.Object(
  {
    todoId: Type.String({ format: 'uuid' }),
  },
  { additionalProperties: false }
);

const incompleteTodoSchema = {
  description: 'this will mark todo as incomplete',
  tags: ['v1|todos'],
  summary: 'mark todo as incomplete',
  operationId: 'incompleteTodo',
  params: PatchSchemaParams,
};
export function PATCH(fastify: FastifyInstance) {
  return {
    schema: incompleteTodoSchema,
    handler: async function (
      request: FastifyRequest<{
        Params: Static<typeof PatchSchemaParams>;
      }>,
      reply: FastifyReply
    ) {
      const data = {
        todoId: request.params.todoId,
        completed: false,
      };

      const promise = updateTodoCompletionById(fastify.kysely, data);
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
        message: 'todo marked as incomplete successfully.',
        data: result.record,
      });
    },
  };
}
