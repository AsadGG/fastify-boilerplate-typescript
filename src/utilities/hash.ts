import type { BinaryLike } from 'node:crypto';
import { createHash } from 'node:crypto';

export function getSha256Hash(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex');
}
