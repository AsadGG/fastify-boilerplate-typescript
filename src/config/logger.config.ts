import { Logger } from 'pino';
import { createLogger } from '../logger/logger.js';

const userLogger = createLogger('USER_LOGGER');
const adminLogger = createLogger('ADMIN_LOGGER');

export function loggerConfig(): {
  loggers: Array<{
    path: string;
    logger: Logger<never>;
  }>;
} {
  return {
    loggers: [
      { path: '/api/v1/user', logger: userLogger },
      { path: '/api/v1/admin', logger: adminLogger },
    ],
  };
}
