import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export function swaggerConfig(): SwaggerOptions {
  return {};
}

export function swaggerUIConfig(): FastifySwaggerUiOptions {
  return {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
    },
  };
}
