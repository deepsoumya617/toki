import {
  createRoomHandler,
  getRoomByIdHandler,
  getRoomsHandler,
  getSidebarRoomsHandler,
  joinRoomHandler,
  leaveRoomByIdHandler,
  updateRoomHandler,
} from './room-handlers';
import {
  createRoomSchema,
  joinRoomSchema,
  roomIdParamSchema,
  roomQuerySchema,
  updateRoomSchema,
} from '@xd/shared';
import { sessionMiddleware } from '../../middleware/session-middleware';
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
  )
  .get('/my', zValidator('query', roomQuerySchema), async c => {
    const session = c.get('session');
    const { id, createdAt, limit } = c.req.valid('query');

    // get cursor
    const cursor = id && createdAt ? { id, createdAt } : undefined;

    const { allRooms, totalRooms, nextCursor, hasNextPage } =
      await getRoomsHandler(session.userId, cursor, limit);

    // compute isOwner and strip ownerId from the response
    const rooms = allRooms.map(({ owner_id, ...room }) => ({
      ...room,
      isOwner: owner_id === session.userId,
    }));

    return c.json({
      success: true,
      allRooms: rooms,
      totalRooms,
      nextCursor,
      hasNextPage,
    });
  })
  .get('/my/sidebar', async c => {
    const session = c.get('session');
    const rooms = await getSidebarRoomsHandler(session.userId);

    return c.json({
      success: true,
      rooms,
    });
  })
  .get('/:roomId', zValidator('param', roomIdParamSchema), async c => {
    const session = c.get('session');
    const { roomId } = c.req.valid('param');

    const room = await getRoomByIdHandler(roomId, session.userId);

    return c.json({
      success: true,
      room,
    });
  })
  .post('/:roomId/leave', zValidator('param', roomIdParamSchema), async c => {
    const session = c.get('session');
    const { roomId } = c.req.valid('param');

    await leaveRoomByIdHandler(roomId, session.userId);

    return c.json({
      success: true,
    });
  })
  .post(
    '/:roomId/update',
    zValidator('param', roomIdParamSchema),
    zValidator('json', updateRoomSchema),
    async c => {
      const session = c.get('session');
      const { roomId } = c.req.valid('param');
      const input = c.req.valid('json');

      const res = await updateRoomHandler(roomId, session.userId, input);

      return c.json({
        success: true,
        res,
      });
    }
  );

export default room;
