export type MyError = Error & {
  statusCode: number;
  code: string;
  error: string;
};
