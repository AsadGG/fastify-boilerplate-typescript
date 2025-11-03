import type { FastifyStaticOptions } from '@fastify/static';
import type { ENVSchemaType } from './env.config';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { GLOBAL_CONSTANTS } from '#root/global-constants';

function initializeStaticServe() {
  [
    'others',
    'images',
    'videos',
    'audios',
    'documents',
    'spreadsheets',
    'presentations',
    'texts',
    'others',
  ].forEach((subDirectory) => {
    const directory = path.join(
      GLOBAL_CONSTANTS.ROOT_PATH,
      'uploads',
      subDirectory,
    );

    mkdirSync(directory, { recursive: true });
  });
}

export function staticServeConfig(config: ENVSchemaType): FastifyStaticOptions {
  initializeStaticServe();
  return {
    root: path.join(GLOBAL_CONSTANTS.ROOT_PATH, config.STATIC_SERVE_FOLDER),
    prefix: config.STATIC_SERVE_PREFIX,
  };
}
