import antfu from '@antfu/eslint-config';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const schemaCustomGroups = { operationId: '^operationId$', tags: '^tags$', hide: '^hide$', summary: '^summary$', description: '^description$', security: '^security$', consumes: '^consumes$', headers: '^headers$', params: '^params$', querystring: '^querystring$', body: '^body$', response: '^response$' };
const schemaGroups = ['operationId', 'tags', 'hide', 'summary', 'description', 'security', 'consumes', 'headers', 'params', 'querystring', 'body', 'response'];

const responseCustomGroups = { statusCode: '^statusCode$', message: '^message$', data: '^data$', pagination: '^pagination$', accessToken: '^accessToken$', refreshToken: '^refreshToken$', createdAt: '^createdAt$', updatedAt: '^updatedAt$' };
const responseGroups = ['statusCode', 'message', 'data', 'pagination', 'unknown', 'accessToken', 'refreshToken', 'createdAt', 'updatedAt'];

const responseSchemaCustomGroups = { OK: 'OK$', CREATED: 'CREATED$', UNAUTHORIZED: 'UNAUTHORIZED$', NOT_FOUND: 'NOT_FOUND$', CONFLICT: 'CONFLICT$' };
const responseSchemaGroups = ['OK', 'CREATED', 'UNAUTHORIZED', 'NOT_FOUND', 'CONFLICT'];

const customGroups = { id: '[Ii]d$', index: '^index$', ...schemaCustomGroups, ...responseSchemaCustomGroups, ...responseCustomGroups, default: '^default$', enum: '^enum$', ref: '^ref$', required: '^required$', type: '^type$', unique: '^unique$' };
const groups = ['id', 'index', ...schemaGroups, ...responseSchemaGroups, ...responseGroups];

export default antfu(
  {
    stylistic: {
      commaDangle: 'only-multiline',
      indent: 2,
      quotes: 'single',
      semi: true,
      severity: 'warn',
    },
    typescript: true,
  },
  {
    name: 'unicorn/recommended',
    rules: eslintPluginUnicorn.configs.recommended.rules,
  },
  {
    rules: {
      'antfu/no-top-level-await': 'off',
      'perfectionist/sort-interfaces': [
        'warn',
        {
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
          type: 'natural',
        },
      ],
      'perfectionist/sort-union-types': [
        'warn',
        {
          groups: ['unknown', 'nullish'],
          order: 'asc',
          type: 'natural',
        },
      ],
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-null': 'off',
    },

  },
);
