import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'admin'),
    maxDepth: 0,
    options: Object.assign({}, opts, { prefix: '/admin' }),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'user'),
    maxDepth: 0,
    options: Object.assign({}, opts, { prefix: '/user' }),
  });
}
