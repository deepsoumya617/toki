import {
  createRoomSchema,
  joinRoomSchema,
  roomIdParamSchema,
} from '@xd/shared';
import { sessionMiddleware } from '../../middleware/session-middleware';
import { createRoomHandler, joinRoomHandler } from './room-handlers';
import type { HonoVariables } from '../auth/auth-routes';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const room = new Hono<{ Variables: HonoVariables }>()
  .use(sessionMiddleware)
  .post('/create', zValidator('json', createRoomSchema), async c => {
    const input = c.req.valid('json');
    const session = c.get('session');

    const data = await createRoomHandler(input, session.userId);

    return c.json({
      success: true,
      data,
    });
  })
  .post(
    '/:roomId/join',
    zValidator('param', roomIdParamSchema),
    zValidator('json', joinRoomSchema),
    async c => {
      const { roomId } = c.req.valid('param');
      const { password } = c.req.valid('json');
      const session = c.get('session');

      const data = await joinRoomHandler(roomId, password, session.userId);

      return c.json({
        success: true,
        data,
      });
    }
  );

export default room;
