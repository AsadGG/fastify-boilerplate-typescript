export async function promiseHandler<T = any, E = any>(
  promise: Promise<T>,
  onfinally?: (() => void) | null | undefined,
) {
  return promise
    .then(result => [null, result, true] as const)
    .catch((error: E) => [error, null, false] as const)
    .finally(onfinally);
}
