'use strict';

import { Type, type Static } from '@sinclair/typebox';
// USER GET
const userGetQueryStringSchema = Type.Object(
  {
    search: Type.Optional(Type.String({ description: 'text to filter' })),
    page: Type.Integer({ minimum: 0, default: 0 }),
    size: Type.Integer({ minimum: 10, default: 10 }),
  },
  { additionalProperties: false }
);
export type UserGetQueryStringType = Static<typeof userGetQueryStringSchema>;
// USER POST
const userPostBodySchema = Type.Object(
  {
    firstName: Type.String(),
    lastName: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    amount: Type.Number(),
    phone: Type.String(),
    roleId: Type.Optional(Type.String({ format: 'uuid' })),
  },
  { additionalProperties: false }
);
export type UserPostBodyType = Static<typeof userPostBodySchema>;

export default {
  USER: {
    GET: {
      description: 'this will get all users',
      tags: ['user'],
      summary: 'get all users',
      querystring: userGetQueryStringSchema,
    },
    POST: {
      description: 'this will create a new user',
      tags: ['user'],
      summary: 'create new user',
      body: userPostBodySchema,
    },
  },
};
