import type { FastifyStaticOptions } from '@fastify/static';
import type { ENVSchemaType } from './environment.config';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { GLOBAL_CONSTANTS } from '#root/global-constants';

function initializeStaticServe() {
  for (const subDirectory of [
    'others',
    'images',
    'videos',
    'audios',
    'documents',
    'spreadsheets',
    'presentations',
    'texts',
    'others',
  ]) {
    const directory = path.join(
      GLOBAL_CONSTANTS.ROOT_PATH,
      'uploads',
      subDirectory,
    );

    mkdirSync(directory, { recursive: true });
  }
}

export function staticServeConfig(config: ENVSchemaType): FastifyStaticOptions {
  initializeStaticServe();
  return {
    prefix: config.STATIC_SERVE_PREFIX,
    root: path.join(GLOBAL_CONSTANTS.ROOT_PATH, config.STATIC_SERVE_FOLDER),
  };
}
