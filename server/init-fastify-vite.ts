import fastify, { FastifyInstance } from "fastify";
import fastifyWebsocket from "fastify-socket.io";
import middie from "middie";

fastify().register(fastifyWebsocket);

interface FastifyWithMiddle extends FastifyInstance {
  use?: (...args: unknown[]) => unknown;
}

export default async (): Promise<FastifyWithMiddle> => {
  const app = fastify();

  await app.register(middie, {
    hook: "onRequest",
  });
  await app.register(fastifyWebsocket);

  return app;
};
