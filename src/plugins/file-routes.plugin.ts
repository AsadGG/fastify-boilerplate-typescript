'use strict';

import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import fs from 'fs';
import path from 'path';

const methods = [
  'DELETE',
  'GET',
  'HEAD',
  'PATCH',
  'POST',
  'PUT',
  'OPTIONS',
] as const;

const extensions = ['.ts'];

function isRoute(extension: string) {
  return extensions.includes(extension);
}

function isTest(name: string) {
  return (
    name.endsWith('.test') || name.endsWith('.spec') || name.endsWith('.bench')
  );
}

function shouldIgnore(name: string) {
  return name.startsWith('_');
}

async function addRequestHandler(
  module: any, // temp
  method: (typeof methods)[number],
  server: FastifyInstance,
  fileRouteServerPath: string
) {
  const route = module[method];
  if (route) {
    server.route({
      ...route(server),
      method: method,
      url: fileRouteServerPath,
    });
  }
}

async function registerRoutes(
  server: FastifyInstance,
  folder: string,
  pathPrefix = ''
) {
  const registerRoutesFolders = fs
    .readdirSync(folder, { withFileTypes: true })
    .map(async (folderOrFile) => {
      const currentPath = path.join(folder, folderOrFile.name);
      const routeServerPath = `${pathPrefix}/${folderOrFile.name
        .replace('[', ':')
        .replace(']', '')}`;
      if (folderOrFile.isDirectory()) {
        await registerRoutes(server, currentPath, routeServerPath);
      } else if (folderOrFile.isFile()) {
        const { ext, name } = path.parse(folderOrFile.name);
        if (!isRoute(ext) || isTest(name) || shouldIgnore(name)) {
          return;
        }
        let fileRouteServerPath = pathPrefix;
        if (name !== 'index') {
          fileRouteServerPath +=
            '/' + name.replace('[', ':').replace(/\]?$/, '');
        }
        if (fileRouteServerPath.length === 0) {
          fileRouteServerPath = '/';
        }
        const module = await import('file://' + currentPath);
        methods.forEach((method) => {
          addRequestHandler(module, method, server, fileRouteServerPath);
        });
      }
    });
  await Promise.all(registerRoutesFolders);
}

async function fileRoutes(server: FastifyInstance, opts: any) {
  if (!(opts && opts.routesFolder)) {
    throw new Error(`fileRoutes: should provide opts.routesFolder`);
  }
  try {
    await registerRoutes(server, opts.routesFolder, opts.pathPrefix);
  } catch (error: any) {
    const { message } = error;
    throw new Error(`fileRoutes: error registering routers: ${message}`);
  }
}

export default fastifyPlugin(fileRoutes);
