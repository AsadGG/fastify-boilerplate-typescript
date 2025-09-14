import { createFile } from '#repositories/file.repository';
import { GLOBAL_CONSTANTS } from '#root/global-constants';
import { ResponseSchema } from '#schemas/common.schema';
import HTTP_STATUS from '#utilities/http-status-codes';
import { promiseHandler } from '#utilities/promise-handler';
import { Static, Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { writeFile } from 'fs/promises';
import path from 'path';

function resolveUploadDirectory(mimetype: string): string {
  if (!mimetype) return 'others';

  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype.startsWith('audio/')) return 'audios';

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

//#region POST
const PostSchemaBody = Type.Object(
  {
    file: Type.Any({ isFile: true }),
  },
  { additionalProperties: false }
);
const uploadFileSchema = {
  description: 'this will upload file',
  tags: ['upload file'],
  summary: 'upload file',
  operationId: 'uploadFile',
  consumes: ['multipart/form-data'],
  body: PostSchemaBody,
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
      'file uploaded successfully.'
    ),
  },
};
export function POST(fastify: FastifyInstance) {
  return {
    schema: uploadFileSchema,
    handler: async function (
      request: FastifyRequest<{
        Body: Static<typeof PostSchemaBody>;
      }>,
      reply: FastifyReply
    ) {
      const { filename, mimetype, buffer, size } = request.body.file;

      const randomName = `${crypto.randomUUID()}.${filename.split('.').pop()}`;

      const uploadSubDirectory = resolveUploadDirectory(mimetype);

      const directory = path.join(
        GLOBAL_CONSTANTS.ROOT_PATH,
        'uploads',
        uploadSubDirectory
      );

      const filePath = path.join(directory, randomName);
      await writeFile(filePath, buffer);

      const url = `${fastify.config.STATIC_SERVE_PREFIX}/${uploadSubDirectory}/${randomName}`;

      const data = {
        filename,
        mimetype,
        size,
        url,
      };

      const promise = createFile(fastify.kysely, data);
      const [error, result, ok] = await promiseHandler(promise);

      if (!ok) {
        const statusCode =
          error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const errorObject = {
          statusCode,
          message: error.message,
        };
        request.log.error({
          payload: data,
          error: error,
        });
        return reply.status(statusCode).send(errorObject);
      }

      return reply.status(HTTP_STATUS.CREATED).send({
        statusCode: HTTP_STATUS.CREATED,
        message: 'file uploaded successfully.',
        data: {
          ...result.record,
          url: `${fastify.config.WEB_SERVER_DOMAIN}${url}`,
        },
      });
    },
  };
}
//#endregion POST
