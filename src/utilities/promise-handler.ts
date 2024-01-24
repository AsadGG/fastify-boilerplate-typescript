export async function promiseHandler<T, E = any>(promise: Promise<T>) {
  return promise
    .then((result) => [result, null] as const)
    .catch((error: E) => [null, error] as const);
}
