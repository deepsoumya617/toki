import {
  createMessageSchema,
  messageIdParamSchema,
  messageQuerySchema,
  roomIdParamSchema,
  updateMessageSchema,
} from '@xd/shared';
import {
  createMessageHandler,
  getMessageHandler,
  updateMessageHandler,
} from './message-handlers';
import { sessionMiddleware } from '../../middleware/session-middleware';
import type { HonoVariables } from '../auth/auth-routes';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

// merge different param schemas
// hono keeps the last one -> so other becomes undefined
const roomMessageParamSchema = roomIdParamSchema.extend(
  messageIdParamSchema.shape
);

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
  )
  .get(
    '/:roomId/messages',
    zValidator('param', roomIdParamSchema),
    zValidator('query', messageQuerySchema),
    async c => {
      const { roomId } = c.req.valid('param');
      const { createdAt, id, limit } = c.req.valid('query');
      const session = c.get('session');

      /// validate cursor
      const cursor = id && createdAt ? { id, createdAt } : undefined;

      const res = await getMessageHandler({
        roomId,
        userId: session.userId,
        cursor,
        limit,
      });

      return c.json({
        success: true,
        ...res,
      });
    }
  )
  .patch(
    '/:roomId/messages/:messageId',
    zValidator('param', roomMessageParamSchema),
    zValidator('json', updateMessageSchema),
    async c => {
      const { roomId, messageId } = c.req.valid('param');
      const { content } = c.req.valid('json');
      const session = c.get('session');

      const res = await updateMessageHandler({
        userId: session.userId,
        roomId,
        messageId,
        content,
      });

      return c.json({
        success: true,
        message: res,
      });
    }
  );

export default message;
