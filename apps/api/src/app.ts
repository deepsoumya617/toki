import { errorHandler } from './middleware/error-middleware';
import roomRoutes from './modules/room/room-routes';
import authRoutes from './modules/auth/auth-routes';
import { prettyJSON } from 'hono/pretty-json';
import { httpEnv } from '@xd/env/http';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

const app = new Hono();

// logger middleware
app.use('*', logger());

// cors middleware
app.use(
  '*',
  cors({
    origin: httpEnv.WEB_ORIGIN,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// pretty json
app.use(prettyJSON());

// routes
export const apiRoutes = app
  .basePath('/api')
  // general route for health check
  .get('/', c => {
    return c.json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
  // rest of the routes
  .route('/auth', authRoutes)
  .route('/rooms', roomRoutes);

// not found route
app.notFound(c => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    },
    404
  );
});

// error handler
app.onError(errorHandler);

export default app;

// rpc
export type ApiType = typeof apiRoutes;
