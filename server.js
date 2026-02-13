/**
 * Custom server with WebSocket support - production-ready
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { handleUpgrade } = require("./server/ws-handler");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    handleUpgrade(wss, request, socket, head);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
