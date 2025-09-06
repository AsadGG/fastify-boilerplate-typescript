import { HttpStatusCode } from '#utilities/http-status-codes';

export type MyError = Error & {
  statusCode: HttpStatusCode;
  code: string;
  error: string;
};
