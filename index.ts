import fastifyEnv from '@fastify/env';
import fastifyRedis from '@fastify/redis';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';
import { Static, Type } from '@sinclair/typebox';
import fastify from 'fastify';
import app from './src/app.js';
import { SIGNAL } from './src/config/constants.js';
import { appLogger } from './src/config/logger.js';

const ENV_SCHEMA = Type.Object(
  {
    APP_PORT: Type.Integer({
      default: 3000,
      minimum: 1000,
      maximum: 65535,
    }),
    REDIS_CLIENT_HOST: Type.String({ default: 'localhost' }),
    REDIS_CLIENT_PORT: Type.Integer({
      default: 6379,
      minimum: 1000,
      maximum: 65535,
    }),
  },
  { additionalProperties: false }
);

declare module 'fastify' {
  interface FastifyInstance {
    config: Static<typeof ENV_SCHEMA>;
  }
}

async function startServer() {
  const server = fastify({ logger: appLogger });

  await server.register(fastifyEnv, {
    confKey: 'config',
    ajv: {
      customOptions: (ajv) => ajv.addSchema({ coerceTypes: true }),
    },
    dotenv: true,
    schema: ENV_SCHEMA,
  });

  await server.register(fastifyRedis, {
    host: server.config.REDIS_CLIENT_HOST,
    port: server.config.REDIS_CLIENT_PORT,
  });

  const fastifySwaggerUiOptions: FastifySwaggerUiOptions & {
    swagger: {
      info: {
        title: string;
        description: string;
        version: string;
      };
    };
  } = {
    routePrefix: '/docs',
    swagger: {
      info: {
        title: 'My Fastify App Documentation Title',
        description: 'My FirstApp Backend Documentation Description',
        version: '1.0.0',
      },
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  };

  await server.register(fastifySwagger, {});
  await server.register(fastifySwaggerUI, fastifySwaggerUiOptions);

  await server.register(app);

  await server.ready();

  await server.listen({
    port: server.config.APP_PORT,
  });

  function gracefulShutdown() {
    server.close(() => {
      server.log.info({ message: `Server is shutting down` });
      process.exit(0);
    });
  }

  process.on(SIGNAL.SIGNIFICANT_TERMINATION, gracefulShutdown);
  process.on(SIGNAL.SIGNIFICANT_INTERRUPT, gracefulShutdown);
}

startServer();
