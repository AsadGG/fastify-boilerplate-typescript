import path from 'node:path';
import { GLOBAL_CONSTANTS } from '#root/global-constants';

export function fileRoutesConfig(): { routesFolder: string } {
  return {
    routesFolder: path.join(GLOBAL_CONSTANTS.ROOT_PATH, 'src', 'routes'),
  };
}
