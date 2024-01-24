import AutoLoad from '@fastify/autoload';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions | undefined
) {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'v1'),
    maxDepth: 0,
    options: Object.assign({}, opts, { prefix: '/v1' }),
  });
}
