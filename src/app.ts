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
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    maxDepth: 0,
    options: Object.assign({}, opts, { prefix: '/' }),
  });
}
