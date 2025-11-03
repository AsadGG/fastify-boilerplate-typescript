import type { FastifyInstance } from 'fastify';
import type pino from 'pino';
import fastifyPlugin from 'fastify-plugin';

export interface FastifyLoggerOptions {
  loggers: Array<{
    logger: pino.Logger<never, boolean>;
    path: string;
  }>;
}

async function fastifyLogger(
  fastify: FastifyInstance,
  opts: FastifyLoggerOptions,
) {
  fastify.addHook('onRequest', async (request) => {
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
