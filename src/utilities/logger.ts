import type { LoggerOptions } from 'pino';
import path from 'node:path';
import { GLOBAL_CONSTANTS } from '#root/global-constants';
import camelCase from 'lodash/camelCase.js';
import kebabCase from 'lodash/kebabCase.js';
import upperFirst from 'lodash/upperFirst.js';
import pino from 'pino';

export function createLogger(moduleName: string) {
  const logFolderPath = path.join(GLOBAL_CONSTANTS.ROOT_PATH, 'logs');
  const logFilePath = path.join(logFolderPath, `${kebabCase(moduleName)}`);

  const serializers:
    | {
      [key: string]: pino.SerializerFn;
    }
    | undefined = {
      request(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.path,
          parameters: request.parameters,
          headers: request.headers,
        };
      },
      reply(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    };

  const redact = {
    paths: ['request.headers.authorization', '*.password'],
    censor: '*** REDACTED ***',
  };

  const targets = [
    {
      level: 'info',
      target: 'pino-roll',
      options: {
        file: logFilePath,
        frequency: 'daily',
        mkdir: true,
        extension: '.log',
        size: '8m',
        dateFormat: 'yyyy-MM-dd',
      },
    },
    {
      level: 'info',
      target: 'pino-pretty',
      options: {
        colorize: true,
        destination: 1,
      },
    },
  ];

  const pinoOptions: LoggerOptions = {
    name: upperFirst(camelCase(moduleName)),
    messageKey: 'message',
    errorKey: 'error',
    redact,
    serializers,
    transport: {
      targets,
    },
  };

  return pino(pinoOptions);
}
