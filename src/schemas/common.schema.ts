import HTTP_STATUS, { HttpStatusCode } from '#utilities/http-status-codes';
import { TSchema, Type } from '@sinclair/typebox';

export const PaginationQuerySchema = Type.Object(
  {
    page: Type.Integer({
      default: 1,
      minimum: 1,
      examples: [1],
      description: 'page number (starts from 1)',
    }),
    size: Type.Integer({
      default: 10,
      minimum: 1,
      examples: [10],
      description: 'number of records per page',
    }),
  },
  { additionalProperties: false }
);

export const SearchQuerySchema = Type.Object(
  {
    search: Type.Optional(
      Type.String({
        description:
          'search term to filter results (applied to supported fields)',
      })
    ),
  },
  { additionalProperties: false }
);
export const PaginationMetaSchema = Type.Object(
  {
    total: Type.Number({
      examples: [30],
      description: 'total number of records',
    }),
    lastPage: Type.Number({
      examples: [3],
      description: 'total number of pages (last available page)',
    }),
    prevPage: Type.Union([Type.Number(), Type.Null()], {
      examples: [1, null],
      description: 'previous page number if available, otherwise null',
    }),
    nextPage: Type.Union([Type.Number(), Type.Null()], {
      examples: [3, null],
      description: 'next page number if available, otherwise null',
    }),
    perPage: Type.Number({
      examples: [10],
      description: 'number of records per page',
    }),
    currentPage: Type.Number({
      examples: [2],
      description: 'current page number',
    }),
  },
  { additionalProperties: false }
);

export function PaginatedResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK,
  message: string = 'records fetched successfully.'
) {
  return Type.Object({
    statusCode: Type.Literal(statusCode),
    message: Type.String({ examples: [message] }),
    data: Type.Array(schema),
    pagination: PaginationMetaSchema,
  });
}

export function ResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = 200,
  message: string = 'record fetched successfully.'
) {
  return Type.Object({
    statusCode: Type.Literal(statusCode),
    message: Type.String({ examples: [message] }),
    data: schema,
  });
}

export function EmptyResponseSchema(
  statusCode: HttpStatusCode = 200,
  message: string = 'action performed successfully.'
) {
  return Type.Object({
    statusCode: Type.Literal(statusCode),
    message: Type.String({ examples: [message] }),
  });
}

export function ErrorResponseSchema(
  statusCode: HttpStatusCode = 400,
  code: string = 'FST_ERROR',
  error: string = 'Bad Request',
  message: string = 'Invalid input provided.'
) {
  return Type.Object({
    statusCode: Type.Literal(statusCode, {
      description: 'http status code of the error response',
    }),
    code: Type.String({
      examples: [code],
      description: 'application or framework-specific error code',
    }),
    error: Type.String({
      examples: [error],
      description: 'short error label or type',
    }),
    message: Type.String({
      examples: [message],
      description: 'detailed human-readable error message',
    }),
  });
}
