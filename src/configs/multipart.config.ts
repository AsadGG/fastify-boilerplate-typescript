import type { FastifyMultipartAttachFieldsToBodyOptions } from '@fastify/multipart';

export function multipartConfig(): FastifyMultipartAttachFieldsToBodyOptions {
  return {
    attachFieldsToBody: 'keyValues',
    async onFile(part: any) {
      const buffer = await part.toBuffer();
      part.value = {
        buffer,
        encoding: part.encoding,
        fieldname: part.fieldname,
        filename: part.filename,
        mimetype: part.mimetype,
        size: buffer.length,
        type: part.type,
      };
    },
  };
}
