import type { FastifyKyselyKVStoreOptions } from '#plugins/kysely-kv.plugin';

function kyselyKVConfig(): FastifyKyselyKVStoreOptions {
  return {
    table: 'key_value_store',
    schema: 'public',
    useUnloggedTable: true,
  };
}

export default kyselyKVConfig;
