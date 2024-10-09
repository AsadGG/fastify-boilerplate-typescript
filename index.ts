import fastifyCORS from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyRedis from '@fastify/redis';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import { fastifyBcrypt } from 'fastify-bcrypt';
import { bcryptConfig } from './src/config/bcrypt.config.js';
import envConfig from './src/config/env.config.js';
import { fileRoutesConfig } from './src/config/file-routes.config.js';
import { JWTConfig } from './src/config/jwt.config.js';
import kyselyConfig from './src/config/kysely.config.js';
import { loggerConfig } from './src/config/logger.config.js';
import { multipartConfig } from './src/config/multipart.config.js';
import { redisConfig } from './src/config/redis.config.js';
import { swaggerConfig, swaggerUIConfig } from './src/config/swagger.config.js';
import { createLogger } from './src/logger/logger.js';
import fileRoutes from './src/plugins/file-routes.plugin.js';
import fastifyJWT from './src/plugins/jwt.plugin.js';
import fastifyKysely from './src/plugins/kysely.plugin.js';
import fastifyLogger from './src/plugins/logger.plugin.js';

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

const appLogger = createLogger('APP_LOGGER');
const server = fastify({
  logger: appLogger,
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
