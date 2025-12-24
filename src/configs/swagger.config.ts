import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export function swaggerConfig(): SwaggerOptions {
  return {
    openapi: {
      components: {
        securitySchemes: {
          AuthorizationUserAccess: {
            in: 'header',
            name: 'Authorization',
            type: 'apiKey',
          },
          AuthorizationUserRefresh: {
            in: 'header',
            name: 'Authorization',
            type: 'apiKey',
          },
        },
      },
      info: {
        description: 'My FirstApp Backend Documentation Description',
        title: 'My Fastify App Documentation Title',
        version: '1.0.0',
      },
      openapi: '3.0.0',
    },
  };
}

const CSS_CONTENT = `
* {
  font-family: monospace !important;
  font-weight: 600 !important;
}
.swagger-ui .parameters-col_description input {
  max-width: 25rem !important;
}
`;

export function swaggerUIConfig(): FastifySwaggerUiOptions {
  return {
    routePrefix: '/api/documentation',
    theme: {
      css: [
        {
          content: CSS_CONTENT,
          filename: 'custom-font-and-input-field-size.css',
        },
      ],
    },
    uiConfig: {
      deepLinking: true,
      docExpansion: 'list',
      persistAuthorization: true,
    },
  };
}
