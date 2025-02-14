import { createLogger } from '#src/logger/logger';

const userLogger = createLogger('USER_LOGGER');
const adminLogger = createLogger('ADMIN_LOGGER');

export function loggerConfig() {
  return {
    loggers: [
      { path: '/api/v1/user', logger: userLogger },
      { path: '/api/v1/admin', logger: adminLogger },
    ],
  };
}
