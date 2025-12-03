import type { ENVSchemaType } from '#configs/environment.config';

function kyselyConfig(config: ENVSchemaType) {
  return {
    connectionString: config.DATABASE_URL,
    max: 10,
  };
}

export default kyselyConfig;
