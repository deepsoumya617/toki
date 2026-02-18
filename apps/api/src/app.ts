import { errorHandler } from './middleware/error.middleware';
import { logger } from 'hono/logger';
import { Hono } from 'hono';

const app = new Hono();

// logger middleware
app.use('*', logger());

// general route for health check
app.get('/api', c => {
  return c.json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

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
