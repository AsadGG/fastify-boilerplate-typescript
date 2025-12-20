import type { CustomJWTOptions } from '#configs/jwt.config';
import type { FastifyInstance } from 'fastify';
import HTTP_STATUS from '#utilities/http-status-codes';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getUserAccessTokenKey,
  getUserRefreshTokenKey,
} from '#utilities/redis-keys';
import createError from '@fastify/error';
import fastifyJWT from '@fastify/jwt';
import fastifyPlugin from 'fastify-plugin';

const NoAuthorizationInHeaderError = createError(
  'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
  'No Authorization was found in request.headers',
  HTTP_STATUS.UNAUTHORIZED,
);

const AuthorizationTokenExpiredError = createError(
  'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED',
  'Authorization token expired',
  HTTP_STATUS.UNAUTHORIZED,
);

const AuthorizationTokenInvalidError = createError(
  'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
  'Authorization token is invalid. format is Bearer 01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  HTTP_STATUS.UNAUTHORIZED,
);

const TOKEN_PATTERN
  = /^([0-9A-F]{8}-[0-9A-F]{4}-[1-7][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}):([A-F0-9]{64})$/i;

async function myFastifyJWT(
  fastify: FastifyInstance,
  options: CustomJWTOptions,
) {
  await fastify.register(fastifyJWT, options.userAccess);
  await fastify.register(fastifyJWT, options.userRefresh);

  const { del, get } = createRedisFunctions(fastify.redis);

  fastify.decorate('authenticateUserAccess', async (request, reply) => {
    try {
      if (!request.headers.authorization) {
        throw new NoAuthorizationInHeaderError();
      }
      const regExpExecArray = TOKEN_PATTERN.exec(
        request.headers.authorization.replace('Bearer ', ''),
      );
      if (!regExpExecArray) {
        throw new AuthorizationTokenInvalidError();
      }
      const [, userId, tokenHash] = regExpExecArray;
      const key = getUserAccessTokenKey(userId, tokenHash);
      const token = await get(key);
      if (!token) {
        throw new AuthorizationTokenExpiredError();
      }
      request.headers.authorization = `Bearer ${token}`;
      await request.userAccessJwtVerify();
    }
    catch (error) {
      reply.send(error);
    }
  });
  fastify.decorate('authenticateUserRefresh', async (request, reply) => {
    try {
      if (!request.headers.authorization) {
        throw new NoAuthorizationInHeaderError();
      }

      const regExpExecArray = TOKEN_PATTERN.exec(
        request.headers.authorization.replace('Bearer ', ''),
      );
      if (!regExpExecArray) {
        throw new AuthorizationTokenInvalidError();
      }
      const [, userId, tokenHash] = regExpExecArray;
      const key = getUserRefreshTokenKey(userId, tokenHash);
      const token = await get(key);
      if (!token) {
        throw new AuthorizationTokenExpiredError();
      }
      await del([key]);
      request.headers.authorization = `Bearer ${token}`;
      await request.userRefreshJwtVerify();
    }
    catch (error) {
      reply.send(error);
    }
  });
}

export default fastifyPlugin(myFastifyJWT);

declare module 'fastify' {
  interface FastifyInstance {
    authenticateUserAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => void;
    authenticateUserRefresh: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => void;
  }

  interface FastifyRequest {
    userAccess: () => Promise<void>;
    userAccessJwtVerify: () => Promise<void>;
    userRefreshJwtVerify: () => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  type JWTNamespaces
    = | 'userAccess'
      | 'userRefresh';

  type OmitNamespacesJWT = Omit<JWT, JWTNamespaces>;

  interface JWT {
    userAccess: OmitNamespacesJWT;
    userRefresh: OmitNamespacesJWT;
  }
}
