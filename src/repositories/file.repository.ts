import { promiseHandler } from '#utilities/promise-handler';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

export async function createFile(
  kysely: Kysely<DB>,
  data: {
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  }
) {
  const query = kysely
    .insertInto('file')
    .values({
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
