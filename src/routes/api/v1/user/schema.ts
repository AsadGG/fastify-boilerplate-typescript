import { Type } from '@sinclair/typebox';

export const getUserSchema = {
  description: `This retrieves a user's data from a Redis cache. If the user's data is not found in the cache, the route returns a 404 Not Found error. Otherwise, the route returns a 200 OK response with the user's data.`,
  tags: ['user'],
  summary: `user's data from a Redis cache`,
};

export const setUserSchema = {
  description: `This sets a user's data in a Redis cache. If the setting user's data in the cache is failed, the route returns a 500 Some Thing Went Wrong error. Otherwise, the route returns a 200 OK response with the user's data.`,
  tags: ['user'],
  summary: `set user's data in a Redis cache`,
  body: Type.Object(
    {
      name: Type.String(),
    },
    { additionalProperties: false }
  ),
};
