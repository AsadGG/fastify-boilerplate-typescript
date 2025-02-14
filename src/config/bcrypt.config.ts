import { bcryptPluginOpts } from '#plugins/bcrypt.plugin';

export function bcryptConfig(): bcryptPluginOpts {
  return {
    saltRounds: 12,
  };
}
