import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthCheckSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions | undefined
) {
  fastify.get(
    '/',
    { schema: healthCheckSchema },
    async function (request, reply) {
      request.log.info({ message: `Server Is Running` });
      return reply.status(200).send({ health: `Server Is Running` });
    }
  );

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'api'),
    maxDepth: 0,
    options: Object.assign({}, opts, { prefix: '/api' }),
  });
}
