import type { Static } from '@sinclair/typebox';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createFile } from '#repositories/file.repository';
import { GLOBAL_CONSTANTS } from '#root/global-constants';
import { ResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { randomUuidV7 } from '#utilities/random-uuid-v7';
import { Type } from '@sinclair/typebox';

function resolveUploadDirectory(mimetype: string): string {
  if (!mimetype)
    return 'others';

  if (mimetype.startsWith('image/'))
    return 'images';
  if (mimetype.startsWith('video/'))
    return 'videos';
  if (mimetype.startsWith('audio/'))
    return 'audios';

  switch (mimetype) {
    case 'application/pdf':
      return 'documents';
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'documents';
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'spreadsheets';
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'presentations';
    case 'text/plain':
      return 'texts';
    default:
      return 'others';
  }
}

// #region POST
const PostSchemaBody = Type.Object(
  {
    file: Type.Any({ isFile: true }),
  },
  { additionalProperties: false },
);
const uploadFileSchema = {
  operationId: 'uploadFile',
  body: PostSchemaBody,
  consumes: ['multipart/form-data'],
  description: 'this will upload file',
  response: {
    [HTTP_STATUS.CREATED]: ResponseSchema(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        filename: Type.String(),
        mimetype: Type.String(),
        size: Type.Number(),
        url: Type.String(),
      }),
      HTTP_STATUS.CREATED,
      'file uploaded successfully.',
    ),
  },
  summary: 'upload file',
  tags: ['upload file'],
};
export function POST(fastify: FastifyInstance) {
  return {
    async handler(
      request: FastifyRequest<{
        Body: Static<typeof PostSchemaBody>;
      }>,
      reply: FastifyReply,
    ) {
      const { buffer, filename, mimetype, size } = request.body.file;

      const newId = randomUuidV7();

      const extension = path.extname(filename).toLowerCase();

      const randomName = `${newId}${extension}`;

      const uploadSubDirectory = resolveUploadDirectory(mimetype);

      const directory = path.join(
        GLOBAL_CONSTANTS.ROOT_PATH,
        'uploads',
        uploadSubDirectory,
      );

      const filePath = path.join(directory, randomName);
      await writeFile(filePath, buffer);

      const url = `${fastify.config.STATIC_SERVE_PREFIX}/${uploadSubDirectory}/${randomName}`;

      const data = {
        id: newId,
        filename,
        mimetype,
        size,
        url,
      };

      const promise = createFile(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode
          = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          message: error.message,
          statusCode,
        };
        request.log.error({
          error,
          payload: data,
        });
        return reply.status(statusCode).send(errorObject);
      }

      return reply.status(HTTP_STATUS.CREATED).send({
        data: {
          ...result.record,
          url: `${fastify.config.WEB_SERVER_BASE_URL}${url}`,
        },
        message: 'file uploaded successfully.',
        statusCode: HTTP_STATUS.CREATED,
      });
    },
    schema: uploadFileSchema,
  };
}
// #endregion POST
