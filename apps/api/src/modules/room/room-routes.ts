import { sessionMiddleware } from '../../middleware/session-middleware';
import type { HonoVariables } from '../auth/auth-routes';
import { createRoomHandler } from './room-handlers';
import { zValidator } from '@hono/zod-validator';
import { createRoomSchema } from '@xd/shared';
import { Hono } from 'hono';

const room = new Hono<{ Variables: HonoVariables }>()
  .use(sessionMiddleware)
  /**
   * @route POST /api/room/create
   * @desc creates a new room
   */
  .post('/create', zValidator('json', createRoomSchema), async c => {
    const input = c.req.valid('json');
    const session = c.get('session');

    const data = await createRoomHandler(input, session.userId);

    return c.json({
      success: true,
      data,
    });
  });

export default room;
