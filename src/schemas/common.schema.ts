import type { HttpStatusCode } from '#utilities/http-status-codes';
import type { TSchema } from '@sinclair/typebox';
import HTTP_STATUS from '#utilities/http-status-codes';
import { Type } from '@sinclair/typebox';

export const PaginationQuerySchema = Type.Object(
  {
    page: Type.Integer({
      default: 1,
      description: 'page number (starts from 1)',
      examples: [1],
      minimum: 1,
    }),
    size: Type.Integer({
      default: 10,
      description: 'number of records per page',
      examples: [10],
      minimum: 1,
    }),
  },
  { additionalProperties: false },
);

export const SearchQuerySchema = Type.Object(
  {
    search: Type.Optional(
      Type.String({
        description:
          'search term to filter results (applied to supported fields)',
      }),
    ),
  },
  { additionalProperties: false },
);
export const PaginationMetaSchema = Type.Object(
  {
    currentPage: Type.Number({
      description: 'current page number',
      examples: [2],
    }),
    lastPage: Type.Number({
      description: 'total number of pages (last available page)',
      examples: [3],
    }),
    nextPage: Type.Union([Type.Number(), Type.Null()], {
      description: 'next page number if available, otherwise null',
      examples: [3, null],
    }),
    perPage: Type.Number({
      description: 'number of records per page',
      examples: [10],
    }),
    prevPage: Type.Union([Type.Number(), Type.Null()], {
      description: 'previous page number if available, otherwise null',
      examples: [1, null],
    }),
    total: Type.Number({
      description: 'total number of records',
      examples: [30],
    }),
  },
  { additionalProperties: false },
);

export function PaginatedResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK,
  message: string = 'records fetched successfully.',
) {
  return Type.Object(
    {
      data: Type.Array(schema),
      message: Type.String({ examples: [message] }),
      pagination: PaginationMetaSchema,
      statusCode: Type.Literal(statusCode),
    },
    { additionalProperties: false },
  );
}

export function ResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = 200,
  message: string = 'record fetched successfully.',
) {
  return Type.Object(
    {
      data: schema,
      message: Type.String({ examples: [message] }),
      statusCode: Type.Literal(statusCode),
    },
    { additionalProperties: false },
  );
}

export function EmptyResponseSchema(
  statusCode: HttpStatusCode = 200,
  message: string = 'action performed successfully.',
) {
  return Type.Object(
    {
      message: Type.String({ examples: [message] }),
      statusCode: Type.Literal(statusCode),
    },
    { additionalProperties: false },
  );
}

export function ErrorResponseSchema(
  statusCode: HttpStatusCode = 400,
  code: string = 'FST_ERROR',
  error: string = 'Bad Request',
  message: string = 'Invalid input provided.',
) {
  return Type.Object(
    {
      code: Type.String({
        description: 'application or framework-specific error code',
        examples: [code],
      }),
      error: Type.String({
        description: 'short error label or type',
        examples: [error],
      }),
      message: Type.String({
        description: 'detailed human-readable error message',
        examples: [message],
      }),
      statusCode: Type.Literal(statusCode, {
        description: 'http status code of the error response',
      }),
    },
    { additionalProperties: false },
  );
}
