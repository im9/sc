import fastify, { FastifyInstance } from "fastify";

interface FastifyWithMiddle extends FastifyInstance {
  use?: (...args: unknown[]) => unknown;
}

export default async (): Promise<FastifyWithMiddle> => {
  const app = fastify();

  await app.register(require("middie"), {
    hook: "onRequest",
  });

  return app;
};
