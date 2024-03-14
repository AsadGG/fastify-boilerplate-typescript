'use strict';

import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import knex from 'knex';

async function fastifyKnexJS(fastify: FastifyInstance, opts: any) {
  const handler = knex(opts);
  fastify.decorate('knex', handler).addHook('onClose', async (instance) => {
    /* istanbul ignore else */
    if (instance.knex === handler) {
      instance.knex.destroy();
      delete instance.knex;
    }
  });
}

export default fastifyPlugin(fastifyKnexJS, '>=0.30.0');
