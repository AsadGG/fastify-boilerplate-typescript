import { CustomJWTOptions } from '#configs/jwt.config';
import { MyError } from '#src/types/my-error';
import HTTP_STATUS from '#utilities/http-status-codes';
import { createRedisFunctions } from '#utilities/redis-helpers';
import {
  getOfficeUserAccessTokenKey,
  getOfficeUserRefreshTokenKey,
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
  getTenantAdminAccessTokenKey,
  getTenantAdminRefreshTokenKey,
} from '#utilities/redis-keys';
import fastifyJWT from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

function noTokenInHeaderError() {
  const error = new Error(
    `No Authorization was found in request.headers`
  ) as MyError;
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_NO_AUTHORIZATION_IN_HEADER`;
  error.error = `Unauthorized`;
  return error;
}
function tokenExpiredError() {
  const error = new Error(`Authorization token expired`) as MyError;
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_AUTHORIZATION_TOKEN_EXPIRED`;
  error.error = `Unauthorized`;
  return error;
}
function tokenInvalidError() {
  const error = new Error(
    `Authorization token is invalid. format is Bearer 01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`
  ) as MyError;
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_AUTHORIZATION_TOKEN_INVALID`;
  error.error = `Unauthorized`;
  return error;
}

const TOKEN_PATTERN =
  /^([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[1-7][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}):([A-Fa-f0-9]{64})$/;

async function myFastifyJWT(fastify: FastifyInstance, opts: CustomJWTOptions) {
  await fastify.register(fastifyJWT, opts.superAdminAccess);
  await fastify.register(fastifyJWT, opts.superAdminRefresh);
  await fastify.register(fastifyJWT, opts.tenantAdminAccess);
  await fastify.register(fastifyJWT, opts.tenantAdminRefresh);
  await fastify.register(fastifyJWT, opts.officeUserAccess);
  await fastify.register(fastifyJWT, opts.officeUserRefresh);

  const { get, del } = createRedisFunctions(fastify.redis);

  fastify.decorate(
    'authenticateSuperAdminAccess',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }
        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const [, superAdminId, tokenHash] = regExpExecArray;
        const key = getSuperAdminAccessTokenKey(superAdminId, tokenHash);
        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.superAdminAccessJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
  fastify.decorate(
    'authenticateSuperAdminRefresh',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }

        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const [, superAdminId, tokenHash] = regExpExecArray;
        const key = getSuperAdminRefreshTokenKey(superAdminId, tokenHash);
        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.superAdminRefreshJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );

  fastify.decorate(
    'authenticateTenantAdminAccess',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }

        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const tenantId = request.params.tenantId;
        const [, tenantAdminId, tokenHash] = regExpExecArray;
        const key = getTenantAdminAccessTokenKey(
          tenantId,
          tenantAdminId,
          tokenHash
        );
        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.tenantAdminAccessJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
  fastify.decorate(
    'authenticateTenantAdminRefresh',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }

        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const tenantId = request.params.tenantId;
        const [, tenantAdminId, tokenHash] = regExpExecArray;
        const key = getTenantAdminRefreshTokenKey(
          tenantId,
          tenantAdminId,
          tokenHash
        );

        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.tenantAdminRefreshJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );

  fastify.decorate(
    'authenticateOfficeUserAccess',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }

        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const tenantId = request.params.tenantId;
        const [, officeUserId, tokenHash] = regExpExecArray;
        const key = getOfficeUserAccessTokenKey(
          tenantId,
          officeUserId,
          tokenHash
        );
        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        request.headers.authorization = `Bearer ${token}`;
        await request.officeUserAccessJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
  fastify.decorate(
    'authenticateOfficeUserRefresh',
    async function (request, reply) {
      try {
        if (!request.headers.authorization) {
          throw noTokenInHeaderError();
        }

        const regExpExecArray = TOKEN_PATTERN.exec(
          request.headers.authorization.replace('Bearer ', '')
        );
        if (!regExpExecArray) {
          throw tokenInvalidError();
        }
        const tenantId = request.params.tenantId;
        const [, officeUserId, tokenHash] = regExpExecArray;
        const key = getOfficeUserRefreshTokenKey(
          tenantId,
          officeUserId,
          tokenHash
        );
        const token = await get(key);
        if (!token) {
          throw tokenExpiredError();
        }
        await del([key]);
        request.headers.authorization = `Bearer ${token}`;
        await request.officeUserRefreshJwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  );
}

export default fastifyPlugin(myFastifyJWT);

declare module 'fastify' {
  interface FastifyInstance {
    authenticateSuperAdminAccess: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => void;
    authenticateSuperAdminRefresh: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => void;
    authenticateTenantAdminAccess: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply
    ) => void;
    authenticateTenantAdminRefresh: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply
    ) => void;
    authenticateOfficeUserAccess: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply
    ) => void;
    authenticateOfficeUserRefresh: (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }>,
      reply: FastifyReply
    ) => void;
  }

  interface FastifyRequest {
    superAdminAccess: () => Promise<void>;
    superAdminAccessJwtVerify: () => Promise<void>;
    superAdminRefreshJwtVerify: () => Promise<void>;
    tenantAdminAccessJwtVerify: () => Promise<void>;
    tenantAdminRefreshJwtVerify: () => Promise<void>;
    officeUserAccessJwtVerify: () => Promise<void>;
    officeUserRefreshJwtVerify: () => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  type JWTNamespaces =
    | 'superAdminAccess'
    | 'superAdminRefresh'
    | 'tenantAdminAccess'
    | 'tenantAdminRefresh'
    | 'officeUserAccess'
    | 'officeUserRefresh';

  type OmitNamespacesJWT = Omit<JWT, JWTNamespaces>;

  interface JWT {
    superAdminAccess: OmitNamespacesJWT;
    superAdminRefresh: OmitNamespacesJWT;
    tenantAdminAccess: OmitNamespacesJWT;
    tenantAdminRefresh: OmitNamespacesJWT;
    officeUserAccess: OmitNamespacesJWT;
    officeUserRefresh: OmitNamespacesJWT;
  }
}
