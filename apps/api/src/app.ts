import { errorHandler } from './middleware/error-middleware';
import authRoutes from './modules/auth/auth-routes';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import { Hono } from 'hono';

const app = new Hono();

// logger middleware
app.use('*', logger());

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
  .route('/auth', authRoutes);

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
export type ApiRoutes = typeof apiRoutes;
