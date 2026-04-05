import { sessionMiddleware } from '../../middleware/session-middleware';
import { createMessageSchema, roomIdParamSchema } from '@xd/shared';
import { createMessageHandler } from './message-handlers';
import type { HonoVariables } from '../auth/auth-routes';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const message = new Hono<{ Variables: HonoVariables }>()
  .use(sessionMiddleware)
  .post(
    '/:roomId/messages',
    zValidator('param', roomIdParamSchema),
    zValidator('json', createMessageSchema),
    async c => {
      const { content } = c.req.valid('json');
      const { roomId } = c.req.valid('param');
      const session = c.get('session');

      const res = await createMessageHandler({
        userId: session.userId,
        roomId,
        content,
      });

      return c.json({
        success: true,
        data: res,
      });
    }
  );

export default message;
