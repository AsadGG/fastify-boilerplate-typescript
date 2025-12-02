import antfu from '@antfu/eslint-config';

const customGroups = { id: '[Ii]d$', index: '^index$', type: '^type$', enum: '^enum$', ref: '^ref$', default: '^default$', required: '^required$', unique: '^unique$', accessToken: '^accessToken$', refreshToken: '^refreshToken$', createdAt: '^createdAt$', updatedAt: '^updatedAt$' };

const groups = ['id', 'index', 'type', 'enum', 'ref', 'default', 'required', 'unique', 'unknown', 'accessToken', 'refreshToken', 'createdAt', 'updatedAt'];

export default antfu({
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
  },
  stylistic: {
    commaDangle: 'only-multiline',
    indent: 2,
    quotes: 'single',
    semi: true,
    severity: 'warn',
  },
});
