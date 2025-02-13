export async function promiseHandler<T = any, E = any>(
  promise: Promise<T>,
  onfinally?: (() => void) | null | undefined
) {
  return promise
    .then((result) => [result, null, true] as const)
    .catch((error: E) => [null, error, false] as const)
    .finally(onfinally);
}
