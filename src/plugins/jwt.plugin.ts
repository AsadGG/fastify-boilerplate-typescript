import type { CustomJWTOptions } from '#configs/jwt.config';
import type { FastifyInstance } from 'fastify';
import HTTP_STATUS from '#utilities/http-status-codes';
import {
  getOfficeUserAccessTokenKey,
  getOfficeUserRefreshTokenKey,
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
  getTenantAdminAccessTokenKey,
  getTenantAdminRefreshTokenKey,
} from '#utilities/key-helpers';
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

async function myFastifyJWT(fastify: FastifyInstance, options: CustomJWTOptions) {
  await fastify.register(fastifyJWT, options.superAdminAccess);
  await fastify.register(fastifyJWT, options.superAdminRefresh);
  await fastify.register(fastifyJWT, options.tenantAdminAccess);
  await fastify.register(fastifyJWT, options.tenantAdminRefresh);
  await fastify.register(fastifyJWT, options.officeUserAccess);
  await fastify.register(fastifyJWT, options.officeUserRefresh);

  const { del, get } = fastify.kvStore;

  fastify.decorate(
    'authenticateSuperAdminAccess',
    async (request, reply) => {
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
        const [, superAdminId, tokenHash] = regExpExecArray;
        const key = getSuperAdminAccessTokenKey(superAdminId, tokenHash);
        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.superAdminAccessJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );
  fastify.decorate(
    'authenticateSuperAdminRefresh',
    async (request, reply) => {
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
        const [, superAdminId, tokenHash] = regExpExecArray;
        const key = getSuperAdminRefreshTokenKey(superAdminId, tokenHash);
        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.superAdminRefreshJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );

  fastify.decorate(
    'authenticateTenantAdminAccess',
    async (request, reply) => {
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
        const tenantId = request.params.tenantId;
        const [, tenantAdminId, tokenHash] = regExpExecArray;
        const key = getTenantAdminAccessTokenKey(
          tenantId,
          tenantAdminId,
          tokenHash,
        );
        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.tenantAdminAccessJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );
  fastify.decorate(
    'authenticateTenantAdminRefresh',
    async (request, reply) => {
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
        const tenantId = request.params.tenantId;
        const [, tenantAdminId, tokenHash] = regExpExecArray;
        const key = getTenantAdminRefreshTokenKey(
          tenantId,
          tenantAdminId,
          tokenHash,
        );

        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.tenantAdminRefreshJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );

  fastify.decorate(
    'authenticateOfficeUserAccess',
    async (request, reply) => {
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
        const tenantId = request.params.tenantId;
        const [, officeUserId, tokenHash] = regExpExecArray;
        const key = getOfficeUserAccessTokenKey(
          tenantId,
          officeUserId,
          tokenHash,
        );
        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.officeUserAccessJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );
  fastify.decorate(
    'authenticateOfficeUserRefresh',
    async (request, reply) => {
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
        const tenantId = request.params.tenantId;
        const [, officeUserId, tokenHash] = regExpExecArray;
        const key = getOfficeUserRefreshTokenKey(
          tenantId,
          officeUserId,
          tokenHash,
        );
        const token = await get(key);
        if (!token) {
          throw new AuthorizationTokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.officeUserRefreshJwtVerify();
      }
      catch (error) {
        reply.send(error);
      }
    },
  );
}

export default fastifyPlugin(myFastifyJWT);

declare module 'fastify' {
  interface FastifyInstance {
    authenticateOfficeUserAccess: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply,
    ) => void;
    authenticateOfficeUserRefresh: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply,
    ) => void;
    authenticateSuperAdminAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => void;
    authenticateSuperAdminRefresh: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => void;
    authenticateTenantAdminAccess: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply,
    ) => void;
    authenticateTenantAdminRefresh: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply,
    ) => void;
  }

  interface FastifyRequest {
    officeUserAccessJwtVerify: () => Promise<void>;
    officeUserRefreshJwtVerify: () => Promise<void>;
    superAdminAccess: () => Promise<void>;
    superAdminAccessJwtVerify: () => Promise<void>;
    superAdminRefreshJwtVerify: () => Promise<void>;
    tenantAdminAccessJwtVerify: () => Promise<void>;
    tenantAdminRefreshJwtVerify: () => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  type JWTNamespaces
    = | 'officeUserAccess'
      | 'officeUserRefresh'
      | 'superAdminAccess'
      | 'superAdminRefresh'
      | 'tenantAdminAccess'
      | 'tenantAdminRefresh';

  type OmitNamespacesJWT = Omit<JWT, JWTNamespaces>;

  interface JWT {
    officeUserAccess: OmitNamespacesJWT;
    officeUserRefresh: OmitNamespacesJWT;
    superAdminAccess: OmitNamespacesJWT;
    superAdminRefresh: OmitNamespacesJWT;
    tenantAdminAccess: OmitNamespacesJWT;
    tenantAdminRefresh: OmitNamespacesJWT;
  }
}
