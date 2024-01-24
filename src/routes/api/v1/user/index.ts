import { Static } from '@sinclair/typebox';
import { FastifyInstance } from 'fastify';
import { REDIS_KEYS } from '../../../../config/constants.js';
import { userLogger } from '../../../../config/logger.js';
import { promiseHandler } from '../../../../utilities/promise-handler.js';
import { getUserSchema, setUserSchema } from './schema.js';

type SetUserBodyType = Static<typeof setUserSchema.body>;

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', function (request, reply, done) {
    request.log = userLogger;
    request.log.info({ request: request.raw, reply: reply.raw });
    done();
  });

  fastify.get(
    '/',
    {
      schema: getUserSchema,
    },
    async function (request, reply) {
      request.log.info({
        message: `Handling GET ${request.url} request`,
      });
      const redisGetPromise = fastify.redis.get(REDIS_KEYS.USER);
      const [redisGetResult, redisGetError] =
        await promiseHandler(redisGetPromise);
      if (!redisGetResult) {
        request.log.error({
          message: `User Value Does Not Exist`,
          error: redisGetError,
        });
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `User Value Does Not Exist`,
        });
      }
      return reply.status(200).send({
        statusCode: 200,
        message: `User Value Found`,
        data: redisGetResult,
      });
    }
  );

  fastify.post<{ Body: SetUserBodyType }>(
    '/',
    {
      schema: setUserSchema,
    },
    async function (request, reply) {
      request.log.info({
        message: `Handling POST ${request.url} request`,
        payload: request.body,
      });
      const redisSetPromise = fastify.redis.set(
        REDIS_KEYS.USER,
        request.body.name
      );
      const [redisSetResult, redisSetError] =
        await promiseHandler(redisSetPromise);
      if (!redisSetResult) {
        request.log.error({
          message: `Could Not Set Value In Redis`,
          error: redisSetError,
        });
        return reply.status(500).send({
          statusCode: 500,
          error: `Something Went Wrong`,
          message: `Could Not Set User Value In Redis`,
        });
      }
      return reply.status(200).send({
        statusCode: 200,
        message: `User Value Has Been Set In Redis`,
      });
    }
  );
}
