import { FastifyInstance, RouteOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const methods = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as const;

type Module = Partial<
  Record<(typeof methods)[number], (fastify: FastifyInstance) => RouteOptions>
>;

const extensions = ['.ts', '.js'];

function isRoute(extension: string) {
  return extensions.includes(extension);
}

function isTest(name: string) {
  return /\.(test|spec|bench)\.[tj]s$/.test(name);
}

function shouldIgnore(name: string) {
  return name.startsWith('_');
}

function normalizeDynamic(name: string) {
  // Converts "[id]" -> ":id"
  return name.replace(/^\[(.+)\]$/, ':$1');
}

async function collectRoutes(
  server: FastifyInstance,
  folder: string,
  pathPrefix = ''
): Promise<RouteOptions[]> {
  const routes: RouteOptions[] = [];
  const entries = await fs.readdir(folder, { withFileTypes: true });

  for (const entry of entries) {
    const currentPath = path.join(folder, entry.name);
    const routeServerPath = `${pathPrefix}/${normalizeDynamic(entry.name)}`;

    if (entry.isDirectory()) {
      const subRoutes = await collectRoutes(
        server,
        currentPath,
        routeServerPath
      );
      routes.push(...subRoutes);
    } else if (entry.isFile()) {
      const { ext, name } = path.parse(entry.name);
      if (!isRoute(ext) || isTest(entry.name) || shouldIgnore(name)) {
        continue;
      }

      let fileRouteServerPath = pathPrefix;
      if (name !== 'index') {
        fileRouteServerPath += '/' + normalizeDynamic(name);
      }
      if (!fileRouteServerPath) fileRouteServerPath = '/';

      try {
        const module: Module = await import(pathToFileURL(currentPath).href);
        for (const method of methods) {
          const route = module[method];
          if (route) {
            routes.push({
              ...route(server),
              method,
              url: fileRouteServerPath,
            });
          }
        }
      } catch (err) {
        server.log.error(
          { err, file: currentPath },
          'Failed to load route module'
        );
      }
    }
  }

  return routes;
}

type FileRoutesOptions = {
  routesFolder: string;
  pathPrefix?: string;
};
async function fileRoutes(server: FastifyInstance, opts: FileRoutesOptions) {
  if (!opts?.routesFolder) {
    throw new Error(`fileRoutes: opts.routesFolder is required`);
  }

  const routes = await collectRoutes(
    server,
    opts.routesFolder,
    opts.pathPrefix ?? ''
  );

  await Promise.all(
    routes
      .sort((a, b) =>
        a.url.localeCompare(b.url, undefined, { sensitivity: 'base' })
      )
      .map((r) => server.route(r))
  );
}

export default fastifyPlugin(fileRoutes);
