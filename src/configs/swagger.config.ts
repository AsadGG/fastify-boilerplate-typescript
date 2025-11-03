import type { SwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export function swaggerConfig(): SwaggerOptions {
  return {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'My Fastify App Documentation Title',
        description: 'My FirstApp Backend Documentation Description',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          AuthorizationSuperAdminAccess: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
          AuthorizationSuperAdminRefresh: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
          AuthorizationTenantAdminAccess: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
          AuthorizationTenantAdminRefresh: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
          AuthorizationOfficeUserAccess: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
          AuthorizationOfficeUserRefresh: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
        },
      },
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
          filename: 'custom-font-and-input-field-size.css',
          content: CSS_CONTENT,
        },
      ],
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  };
}
