import type { bcryptPluginOptions } from '#plugins/bcrypt.plugin';

export function bcryptConfig(): bcryptPluginOptions {
  return {
    saltRounds: 12,
  };
}
