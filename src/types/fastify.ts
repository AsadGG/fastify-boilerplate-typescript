import type { FastifyRequest, RouteGenericInterface } from 'fastify';

export type AuthenticatedFastifyRequest<
  T extends RouteGenericInterface = RouteGenericInterface,
> = FastifyRequest<T>
  & {
    user: {
      userId: string;
    };
  };
