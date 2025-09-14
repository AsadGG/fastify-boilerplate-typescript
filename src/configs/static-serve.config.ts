import { GLOBAL_CONSTANTS } from '#root/global-constants';
import { FastifyStaticOptions } from '@fastify/static';
import { mkdirSync } from 'fs';
import path from 'path';
import { ENVSchemaType } from './env.config';

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
  ].map((subDirectory) => {
    const directory = path.join(
      GLOBAL_CONSTANTS.ROOT_PATH,
      'uploads',
      subDirectory
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
