export type bcryptPluginOpts = {
  saltWorkFactor: number;
};

export function bcryptConfig(): bcryptPluginOpts {
  return {
    saltWorkFactor: 12,
  };
}
