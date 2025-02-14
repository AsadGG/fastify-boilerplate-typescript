import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

export type bcryptPluginOpts = {
  saltRounds: number;
};

async function fastifyBcrypt(fastify: FastifyInstance, opts: bcryptPluginOpts) {
  const saltRounds = opts.saltRounds || 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  fastify.decorate('bcrypt', {
    compare(data, hash) {
      return bcrypt.compare(data, hash);
    },
    hash(data: string | Buffer) {
      return bcrypt.hash(data, salt);
    },
  });
}

export default fastifyPlugin(fastifyBcrypt);

declare module 'fastify' {
  interface FastifyInstance {
    bcrypt: {
      hash(data: string | Buffer): Promise<string>;

      compare(data: string | Buffer, encrypted: string): Promise<boolean>;
    };
  }
}
