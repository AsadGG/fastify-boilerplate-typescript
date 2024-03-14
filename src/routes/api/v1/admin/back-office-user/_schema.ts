'use strict';

import { Static, Type } from '@sinclair/typebox';
// CREATE POST
const createPostBodySchema = Type.Object(
  {
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    avatar: Type.Any({ isFile: true }),
  },
  { additionalProperties: false }
);
export type CreatePostBodyType = Static<typeof createPostBodySchema>;
// LOGIN POST
const loginPostBodySchema = Type.Object(
  {
    email: Type.String({ format: 'email' }),
    password: Type.String(),
  },
  { additionalProperties: false }
);
export type LoginPostBodyType = Static<typeof loginPostBodySchema>;

export default {
  CREATE: {
    POST: {
      description: 'this will create',
      tags: ['admin'],
      summary: 'create',
      consumes: ['multipart/form-data'],
      body: createPostBodySchema,
      headers: Type.Object({
        Authorization: Type.String(),
      }),
      security: [
        {
          Authorization: [],
        },
      ],
    },
  },
  LOGIN: {
    POST: {
      description: 'this will login',
      tags: ['admin'],
      summary: 'Login',
      body: loginPostBodySchema,
    },
  },
};
