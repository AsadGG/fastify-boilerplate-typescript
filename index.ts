import { bcryptConfig } from '#configs/bcrypt.config';
import envConfig from '#configs/env.config';
import { fileRoutesConfig } from '#configs/file-routes.config';
import { JWTConfig } from '#configs/jwt.config';
import kyselyConfig from '#configs/kysely.config';
import { loggerConfig } from '#configs/logger.config';
import { multipartConfig } from '#configs/multipart.config';
import { redisConfig } from '#configs/redis.config';
import { swaggerConfig, swaggerUIConfig } from '#configs/swagger.config';
import fastifyBcrypt from '#plugins/bcrypt.plugin';
import fileRoutes from '#plugins/file-routes.plugin';
import fastifyJWT from '#plugins/jwt.plugin';
import fastifyKysely from '#plugins/kysely.plugin';
import fastifyLogger from '#plugins/logger.plugin';
import { createLogger } from '#utilities/logger';
import fastifyCORS from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyRedis from '@fastify/redis';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';

process.env.TZ = 'UTC';

function ajvFilePlugin(ajv: any) {
  return ajv.addKeyword({
    keyword: 'isFile',
    compile: (_schema: any, parent: any) => {
      parent.type = 'file';
      delete parent.isFile;
      return () => true;
    },
  });
}

const systemLogger = createLogger('SYSTEM_LOGGER');
const server = fastify({
  genReqId: () => crypto.randomUUID(),
  loggerInstance: systemLogger,
  ajv: {
    plugins: [ajvFilePlugin],
    customOptions: {
      keywords: ['collectionFormat'],
    },
  },
});

await server.register(fastifyEnv, envConfig());

await server.register(fastifyLogger, loggerConfig());

await server.register(fastifyCORS, { origin: '*' });

await server.register(fastifyKysely, kyselyConfig(server.config));

await server.register(fastifyRedis, redisConfig(server.config));

await server.register(fastifyFormbody);

await server.register(fastifyMultipart, multipartConfig());

await server.register(fastifyBcrypt, bcryptConfig());

await server.register(fastifyJWT, JWTConfig(server.config));

await server.register(fastifySwagger, swaggerConfig());

await server.register(fastifySwaggerUi, swaggerUIConfig());

await server.register(fileRoutes, fileRoutesConfig());

server.get(
  '/',
  {
    schema: {
      hide: true,
    },
  },
  (_request, reply) => {
    return reply.redirect('/api');
  }
);

await server.ready();

await server.listen({
  host: server.config.WEB_SERVER_HOST,
  port: server.config.WEB_SERVER_PORT,
  listenTextResolver: () => {
    const host =
      server.config.WEB_SERVER_HOST === '0.0.0.0'
        ? 'localhost'
        : server.config.WEB_SERVER_HOST;
    return `server is listening at http://${host}:${server.config.WEB_SERVER_PORT}`;
  },
});

function gracefulShutdown() {
  server.close(() => {
    server.log.info({ message: `Server is shutting down` });
    process.exit(0);
  });
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
