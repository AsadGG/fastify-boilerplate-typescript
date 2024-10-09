import { BinaryLike, createHash } from 'crypto';

export function getSha256Hash(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex');
}
