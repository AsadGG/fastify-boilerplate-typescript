import path from 'path';
import { GLOBAL_CONSTANTS } from '../../global-constants.js';

export function fileRoutesConfig(): { routesFolder: string } {
  return {
    routesFolder: path.join(GLOBAL_CONSTANTS.ROOT_PATH, 'src', 'routes'),
  };
}
