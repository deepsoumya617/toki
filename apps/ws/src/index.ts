import {
  getSessionFromRedis,
  REDIS_SESSION_PREFIX,
  SESSION_COOKIE_NAME,
} from '@xd/shared';
import type { ClientMessage, ServerMessage, WsData } from './types';
import { roomMembers } from '@xd/db/schema/room-members';
import { redis, subscriber } from './lib/redis';
import type { ServerWebSocket } from 'bun';
import { and, eq } from 'drizzle-orm';
import { wsEnv } from '@xd/env/ws';
import { db } from '@xd/db';

// connect to redis
await redis.connect();

// send typed message
function send(ws: ServerWebSocket<WsData>, msg: ServerMessage) {
  ws.send(JSON.stringify(msg));
}

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
    async message(ws, raw) {
      let parsed: ClientMessage;

      try {
        parsed = JSON.parse(raw as string) as ClientMessage;
      } catch {
        send(ws, { type: 'error', payload: 'Invalid message format' });
        return;
      }

      if (parsed.type === 'subscribe') {
        const { roomId } = parsed.payload;

        // check membership
        const [member] = await db
          .select({ id: roomMembers.id })
          .from(roomMembers)
          .where(
            and(
              eq(roomMembers.room_id, roomId),
              eq(roomMembers.user_id, ws.data.userId)
            )
          );

        if (!member) {
          send(ws, { type: 'error', payload: 'Not a member of this room' });
          return;
        }

        // subscribe to rooms ServerWebSocket
        ws.subscribe(`room:${roomId}`);
        send(ws, { type: 'subscribed', payload: { roomId } });
        console.log(`${ws.data.userId} subscribed to room:${roomId}`);
      }

      if (parsed.type === 'unsubscribe') {
        const { roomId } = parsed.payload;

        // unsubscribe from socket
        ws.unsubscribe(`room:${roomId}`);
        send(ws, { type: 'unsubscribed', payload: { roomId } });
      }

      if (parsed.type === 'ping') {
        send(ws, { type: 'pong', payload: null });
      }
    },
    close(ws) {
      console.log('client disconnected');
    },
  },
});

// subscribe to message channel
await subscriber.subscribe('messages', raw => {
  const data = JSON.parse(raw);
  server.publish(`room:${data.roomId}`, raw);
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
