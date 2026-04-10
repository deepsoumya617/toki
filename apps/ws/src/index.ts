// import { redis } from './lib/redis';

// connect to redis
// await redis.connect();

// bootstrap ws server
const server = Bun.serve({
  port: 8081,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req);
      if (upgraded) return;
      return new Response('Websocket upgrade failed', { status: 500 });
    }

    // health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
  websocket: {
    open(ws) {
      console.log('client connected');
    },
    message(ws, message) {
      ws.send('wassup nigga');
      console.log('Message: ', message);
    },
    close(ws) {
      console.log('client disconnected');
    },
  },
});

console.log(`WS server running on ws://localhost:${server.port}`);
