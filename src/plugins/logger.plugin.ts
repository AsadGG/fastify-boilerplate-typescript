import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import pino from 'pino';

export type FastifyLoggerOptions = {
  loggers: Array<{
    logger: pino.Logger<never, boolean>;
    path: string;
  }>;
};

async function fastifyLogger(
  fastify: FastifyInstance,
  opts: FastifyLoggerOptions
) {
  fastify.addHook('onRequest', async function (request) {
    const rawURL = request.raw.url;
    for (const logger of opts.loggers) {
      if (rawURL) {
        if (rawURL.includes(logger.path)) {
          request.log = logger.logger;
          break;
        }
      }
    }
  });
}

export default fastifyPlugin(fastifyLogger);
