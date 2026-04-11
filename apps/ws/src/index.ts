import {
  getSessionFromRedis,
  REDIS_SESSION_PREFIX,
  SESSION_COOKIE_NAME,
} from '@xd/shared';
import type { WsData } from './types';
import { redis } from './lib/redis';
import { wsEnv } from '@xd/env/ws';

// connect to redis
await redis.connect();

// bootstrap ws server
const server = Bun.serve<WsData>({
  port: wsEnv.WS_PORT,
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      // get the cookies first
      const cookieHeader = req.headers.get('cookie');
      if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

      // get the token
      const token = new Bun.CookieMap(cookieHeader).get(SESSION_COOKIE_NAME);
      if (!token) return new Response('Unauthorized', { status: 401 });

      // get the session from redis
      const session = await getSessionFromRedis({
        redis,
        redisKey: `${REDIS_SESSION_PREFIX}${token}`,
      });

      if (!session) return new Response('Unauthorized', { status: 401 });

      const upgraded = server.upgrade(req, {
        data: { userId: session.userId },
      });
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
    data: {} as WsData,
    open(ws) {
      console.log('client connected: ', ws.data.userId);
    },
    message(ws, message) {
      ws.send('wassup nigga');
      console.log(`Message from ${ws.data.userId}: `, message);
    },
    close(ws) {
      console.log('client disconnected');
    },
  },
});

console.log(`WS server running on ws://localhost:${server.port}`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WS server...');
  server.stop(true);
  redis.close();

  console.log('WS server stopped');
  process.exit(0);
});
