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
      reply(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
      request(request) {
        return {
          headers: request.headers,
          method: request.method,
          parameters: request.parameters,
          path: request.path,
          url: request.url,
        };
      },
    };

  const redact = {
    censor: '*** REDACTED ***',
    paths: ['request.headers.authorization', '*.password'],
  };

  const targets = [
    {
      level: 'info',
      options: {
        dateFormat: 'yyyy-MM-dd',
        extension: '.log',
        file: logFilePath,
        frequency: 'daily',
        mkdir: true,
        size: '8m',
      },
      target: 'pino-roll',
    },
    {
      level: 'info',
      options: {
        colorize: true,
        destination: 1,
      },
      target: 'pino-pretty',
    },
  ];

  const pinoOptions: LoggerOptions = {
    errorKey: 'error',
    messageKey: 'message',
    name: upperFirst(camelCase(moduleName)),
    redact,
    serializers,
    transport: {
      targets,
    },
  };

  return pino(pinoOptions);
}
