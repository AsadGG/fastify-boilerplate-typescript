import type { ENVSchemaType } from '#configs/env.config';

function kyselyConfig(config: ENVSchemaType) {
  return {
    connectionString: config.DATABASE_URL,
    max: 10,
  };
}

export default kyselyConfig;
