'use strict';

import { Static, Type } from '@sinclair/typebox';
// USER_ID GET
const userIdGetParamsSchema = Type.Object(
  { userId: Type.String({ format: 'uuid' }) },
  { additionalProperties: false }
);
export type UserIdGetParamsType = Static<typeof userIdGetParamsSchema>;
// USER_ID PATCH
const userIdPatchParamsSchema = Type.Object(
  { userId: Type.String({ format: 'uuid' }) },
  { additionalProperties: false }
);
export type UserIdPatchParamsType = Static<typeof userIdPatchParamsSchema>;
const userIdPatchBodySchema = Type.Object(
  {
    firstName: Type.Optional(Type.String()),
    lastName: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: 'email' })),
    amount: Type.Optional(Type.Number()),
    phone: Type.Optional(Type.String()),
    roleId: Type.Optional(Type.String({ format: 'uuid' })),
  },
  { additionalProperties: false }
);
export type UserIdPatchBodyType = Static<typeof userIdPatchBodySchema>;
// USER_ID DELETE
const userIdDeleteParamsSchema = Type.Object(
  { userId: Type.String({ format: 'uuid' }) },
  { additionalProperties: false }
);
export type UserIdDeleteParamsType = Static<typeof userIdDeleteParamsSchema>;

export default {
  USER_ID: {
    GET: {
      description: 'this will get a user',
      tags: ['user'],
      summary: 'get a user',
      params: userIdGetParamsSchema,
    },
    PATCH: {
      description: 'this will update a user',
      tags: ['user'],
      summary: 'update a user',
      params: userIdPatchParamsSchema,
      body: userIdPatchBodySchema,
    },
    DELETE: {
      description: 'this will a delete user',
      tags: ['user'],
      summary: 'delete a user',
      params: userIdDeleteParamsSchema,
    },
  },
};
