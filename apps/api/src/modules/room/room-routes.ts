import type { HonoVariables } from '../auth/auth-routes';
import { Hono } from 'hono';

const room = new Hono<{ Variables: HonoVariables }>()
  /**
   * @route POST /api/room/create
   * @desc creates a new room
   */
  .post('/create', async c => {});

export default room;
