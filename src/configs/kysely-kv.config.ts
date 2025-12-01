import type { FastifyKyselyKVStoreOptions } from '#plugins/kysely-kv.plugin';

function kyselyKVConfig(): FastifyKyselyKVStoreOptions {
  return {
    schema: 'public',
    table: 'key_value_store',
    useUnloggedTable: true,
  };
}

export default kyselyKVConfig;
