import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

async function fastifyBcrypt(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const saltRounds = options.saltRounds || 10;

  async function hash(password: string) {
    return bcrypt.hash(password, saltRounds);
  }

  async function compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  fastify.decorate('bcrypt', { hash, compare });
}

const fastifyBcryptPlugin = fp(fastifyBcrypt);

export default fp(async function (fastify) {
  fastify.register(fastifyBcryptPlugin, {
    saltRounds: 12,
  });
});
