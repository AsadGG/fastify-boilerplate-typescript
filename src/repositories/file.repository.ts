import type { DB } from '#src/types/database';
import type { Kysely } from 'kysely';
import { promiseHandler } from '#utilities/promise-handler';

export async function createFile(
  kysely: Kysely<DB>,
  data: {
    id: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  },
) {
  const query = kysely
    .insertInto('file')
    .values({
      id: data.id,
      filename: data.filename,
      mimetype: data.mimetype,
      size: data.size,
      url: data.url,
    })
    .returning(['id', 'filename', 'mimetype', 'size', 'url'])
    .executeTakeFirst();

  const [error, result, ok] = await promiseHandler(query);

  if (!ok) {
    throw error;
  }

  const record = result;

  return { record };
}
