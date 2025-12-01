import type { FastifyLoggerOptions } from '#plugins/logger.plugin';
import { createLogger } from '#utilities/logger';

const userLogger = createLogger('USER_LOGGER');
const adminLogger = createLogger('ADMIN_LOGGER');

export function loggerConfig(): FastifyLoggerOptions {
  return {
    loggers: [
      { logger: userLogger, path: '/api/v1/user' },
      { logger: adminLogger, path: '/api/v1/admin' },
    ],
  };
}
