export type MyError = Error & {
  statusCode: number;
  code: string;
  error: string;
};

import fastifyJWT from '@fastify/jwt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { CustomJWTOptions } from '../config/jwt.config.js';
import HTTP_STATUS from '../utilities/http-status.js';
import { createRedisFunctions } from '../utilities/redis-helpers.js';
import {
  getOfficeUserAccessTokenKey,
  getOfficeUserRefreshTokenKey,
  getSuperAdminAccessTokenKey,
  getSuperAdminRefreshTokenKey,
  getTenantAdminAccessTokenKey,
  getTenantAdminRefreshTokenKey,
} from '../utilities/redis-keys.js';

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
  /^([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[4][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}):([A-Fa-f0-9]{64})$/;

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
    async function (
      request: FastifyRequest & {
        superAdminAccessJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
    async function (
      request: FastifyRequest & {
        superAdminRefreshJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
    async function (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }> & {
        tenantAdminAccessJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
    async function (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }> & {
        tenantAdminRefreshJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
    async function (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }> & {
        officeUserAccessJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
    async function (
      request: FastifyRequest<{
        Params: { tenantId: string };
      }> & {
        officeUserRefreshJwtVerify: () => Promise<any>;
      },
      reply: FastifyReply
    ) {
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
