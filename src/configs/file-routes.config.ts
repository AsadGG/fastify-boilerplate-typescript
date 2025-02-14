import { GLOBAL_CONSTANTS } from '#root/global-constants';
import path from 'path';

export function fileRoutesConfig(): { routesFolder: string } {
  return {
    routesFolder: path.join(GLOBAL_CONSTANTS.ROOT_PATH, 'src', 'routes'),
  };
}
