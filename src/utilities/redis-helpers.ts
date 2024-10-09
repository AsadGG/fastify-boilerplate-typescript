import { FastifyRedis } from '@fastify/redis';

export function createRedisFunctions(redis: FastifyRedis) {
  async function get(key: string) {
    try {
      const stringifiedJson = await redis.get(key);
      if (stringifiedJson) {
        return JSON.parse(stringifiedJson);
      }
      return null;
    } catch {
      await redis.del(key);
      return null;
    }
  }

  async function set(key: string, value: any, expiryInSeconds: number) {
    const stringifiedJson = JSON.stringify(value);
    if (expiryInSeconds) {
      return redis.set(key, stringifiedJson, 'EX', expiryInSeconds);
    }
    return redis.set(key, stringifiedJson);
  }

  async function keys(pattern: string) {
    return redis.keys(pattern);
  }

  async function del(keys: string[]) {
    return redis.del(keys);
  }

  return {
    get,
    set,
    keys,
    del,
  };
}
