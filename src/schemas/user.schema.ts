import { Type } from '@sinclair/typebox';

export const UserSchema = Type.Object(
  {
    id: Type.String({
      description: 'Unique identifier of the user',
      format: 'uuid',
    }),
    email: Type.String({ description: 'Email address', format: 'email' }),
    image: Type.Union([
      Type.Object({
        filename: Type.String({ examples: ['profile-picture.png'] }),
        mimetype: Type.String({ examples: ['image/png'] }),
        size: Type.Number({ examples: [8192] }),
        url: Type.String({ format: 'uri' }),
      }),
      Type.Null(),
    ]),
    name: Type.String({
      description: 'Full name of the user',
      examples: ['John Doe'],
    }),
    phone: Type.String({
      description: 'Phone number',
      examples: ['03001234567'],
    }),
  },
  { additionalProperties: false },
);

export const AuthenticateUserSchema = Type.Composite([
  UserSchema,
  Type.Object({
    accessToken: Type.String({
      description: 'Access token used for authentication',
      examples: [
        '01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ],
    }),
    refreshToken: Type.String({
      description: 'Refresh token used to obtain new access tokens',
      examples: [
        '01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      ],
    }),
  }),
], { additionalProperties: false });
