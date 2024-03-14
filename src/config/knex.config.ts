import { Knex } from 'knex';
import snakeCase from 'lodash/snakeCase.js';
import { camelCaseKeys } from '../utilities/case-converter.js';
import { ENVSchemaType } from './env.config.js';

declare module 'fastify' {
  interface FastifyInstance {
    knex?: Knex;
  }
}

function transformKnexResponse(result: any) {
  if (!result) {
    return result;
  }
  if (result.command === 'INSERT') {
    if (result.rows.length) {
      return camelCaseKeys(result.rows);
    }
    return result.rowCount;
  }
  if (result.command === 'SELECT') {
    return camelCaseKeys(result.rows);
  }
  if (result.command === 'DELETE') {
    return result.rowCount;
  }
  if (result.command === 'UPDATE') {
    if (result.rows.length) {
      return camelCaseKeys(result.rows);
    }
    return result.rowCount;
  }
  return camelCaseKeys(result);
}

function knexConfig(config: ENVSchemaType) {
  return {
    client: 'pg',
    version: '7.2',
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DATABASE,
    },
    pool: { min: 0, max: 7 },
    wrapIdentifier: (value: any, origImpl: any) => {
      if (value === '*') return value;
      return origImpl(snakeCase(value));
    },
    postProcessResponse: (result: any) => {
      if (Array.isArray(result)) {
        return result.map(transformKnexResponse);
      }
      return transformKnexResponse(result);
    },
  };
}

export default knexConfig;
