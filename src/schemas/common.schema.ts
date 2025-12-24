import type { HttpStatusCode } from '#utilities/http-status-codes';
import type { TSchema } from '@sinclair/typebox';
import HTTP_STATUS from '#utilities/http-status-codes';
import { Type } from '@sinclair/typebox';

export const PaginationQuerySchema = Type.Object(
  {
    page: Type.Integer({
      description: 'Page number (starts from 1)',
      default: 1,
      examples: [1],
      minimum: 1,
    }),
    size: Type.Integer({
      description: 'Number of records per page',
      default: 10,
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
          'Search term to filter results (applied to supported fields)',
      }),
    ),
  },
  { additionalProperties: false },
);
export const PaginationMetaSchema = Type.Object(
  {
    currentPage: Type.Number({
      description: 'Current page number',
      examples: [2],
    }),
    lastPage: Type.Number({
      description: 'Total number of pages (last available page)',
      examples: [3],
    }),
    nextPage: Type.Union([Type.Number(), Type.Null()], {
      description: 'Next page number if available, otherwise null',
      examples: [3, null],
    }),
    perPage: Type.Number({
      description: 'Number of records per page',
      examples: [10],
    }),
    prevPage: Type.Union([Type.Number(), Type.Null()], {
      description: 'Previous page number if available, otherwise null',
      examples: [1, null],
    }),
    total: Type.Number({
      description: 'Total number of records',
      examples: [30],
    }),
  },
  { additionalProperties: false },
);

export function PaginatedResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = HTTP_STATUS.OK,
  message = 'Records fetched successfully.',
) {
  return Type.Object(
    {
      statusCode: Type.Literal(statusCode),
      message: Type.String({ examples: [message] }),
      data: Type.Array(schema),
      pagination: PaginationMetaSchema,
    },
    { additionalProperties: false },
  );
}

export function ResponseSchema<T extends TSchema>(
  schema: T,
  statusCode: HttpStatusCode = 200,
  message = 'Record fetched successfully.',
) {
  return Type.Object(
    {
      statusCode: Type.Literal(statusCode),
      message: Type.String({ examples: [message] }),
      data: schema,
    },
    { additionalProperties: false },
  );
}

export function EmptyResponseSchema(
  statusCode: HttpStatusCode = 200,
  message = 'Action performed successfully.',
) {
  return Type.Object(
    {
      statusCode: Type.Literal(statusCode),
      message: Type.String({ examples: [message] }),
    },
    { additionalProperties: false },
  );
}

export function ErrorResponseSchema(
  statusCode: HttpStatusCode = 400,
  code = 'FST_ERROR',
  error = 'Bad Request',
  message = 'Invalid input provided.',
) {
  return Type.Object(
    {
      statusCode: Type.Literal(statusCode, {
        description: 'Http status code of the error response',
      }),
      message: Type.String({
        description: 'Detailed human-readable error message',
        examples: [message],
      }),
      code: Type.String({
        description: 'Application or framework-specific error code',
        examples: [code],
      }),
      error: Type.String({
        description: 'Short error label or type',
        examples: [error],
      }),
    },
    { additionalProperties: false },
  );
}
