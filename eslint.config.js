import antfu from '@antfu/eslint-config';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const customGroups = { id: '[Ii]d$', index: '^index$', type: '^type$', enum: '^enum$', ref: '^ref$', default: '^default$', required: '^required$', unique: '^unique$', statusCode: '^statusCode$', message: '^message$', data: '^data$', pagination: '^pagination$', accessToken: '^accessToken$', refreshToken: '^refreshToken$', createdAt: '^createdAt$', updatedAt: '^updatedAt$' };
const groups = ['id', 'index', 'type', 'enum', 'ref', 'default', 'required', 'unique', 'statusCode', 'message', 'data', 'pagination', 'unknown', 'accessToken', 'refreshToken', 'createdAt', 'updatedAt'];

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
          type: 'natural',
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          type: 'natural',
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          type: 'natural',
          customGroups,
          groups,
          order: 'asc',
          partitionByComment: true,
        },
      ],
      'perfectionist/sort-union-types': [
        'warn',
        {
          type: 'natural',
          groups: ['unknown', 'nullish'],
          order: 'asc',
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
