import initFastifyVite from "./init-fastify-vite";
import { createPageRenderer } from "vite-plugin-ssr";

const isProduction = process.env.NODE_ENV === "production";
const root = `${__dirname}/..`;

const startServer = async () => {
  const app = await initFastifyVite();

  const server = require("http").createServer(app);
  const io = require("socket.io")(server);
  const bubbles = require("../synth/bubbles");

  let viteDevServer;

  if (isProduction) {
  } else {
    const { createServer } = await import("vite");

    viteDevServer = await createServer({
      root,
      server: {
        middlewareMode: "ssr",
      },
    });

    app.use && app.use(viteDevServer.middlewares);
  }

  const renderPage = createPageRenderer({
    viteDevServer,
    isProduction,
    root,
  });

  app.get("*", async (req, rep) => {
    const pageContextInit = {
      url: req.url,
    };

    const pageContext = await renderPage(pageContextInit);

    const { httpResponse } = pageContext;

    if (!httpResponse) return rep.code(500);

    const { body, statusCode, contentType } = httpResponse;

    rep.code(statusCode).type(contentType).send(body);
  });

  app.get("/ping", async (_, rep) => rep.send("Pong"));

  app.ready((err) => {
    if (err) throw err;

    app.io.on("connection", (socket: any) => {
      socket.on("exec message", (msg: string) => {
        if (msg === "bubbles") {
          console.log("exec: " + msg);
          bubbles();
        }
        console.log("message: " + msg);
        io.emit("exec message", msg); // TODO ブラウザにログを送信
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  });

  const port = process.env.PORT || 3000;

  app.listen(port, (err, address) => {
    if (err) {
      console.log(err);
    }

    console.log(`Server running at ${address}`);
  });
};

startServer();
