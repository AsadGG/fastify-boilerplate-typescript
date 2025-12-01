import type { FastifyInstance } from 'fastify';
import type { Buffer } from 'node:buffer';
import bcrypt from 'bcrypt';
import fastifyPlugin from 'fastify-plugin';

export interface bcryptPluginOpts {
  saltRounds: number;
}

async function fastifyBcrypt(fastify: FastifyInstance, opts: bcryptPluginOpts) {
  const saltRounds = opts.saltRounds || 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  fastify.decorate('bcrypt', {
    compare(data, hash) {
      return bcrypt.compare(data, hash);
    },
    hash(data: Buffer | string) {
      return bcrypt.hash(data, salt);
    },
  });
}

export default fastifyPlugin(fastifyBcrypt);

declare module 'fastify' {
  interface FastifyInstance {
    bcrypt: {
      compare: (data: Buffer | string, encrypted: string) => Promise<boolean>;
      hash: (data: Buffer | string) => Promise<string>;
    };
  }
}
