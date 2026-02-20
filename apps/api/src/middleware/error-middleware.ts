import { ApiError } from '../lib/errors';
import { httpEnv } from '@xd/env/http';
import type { Context } from 'hono';

export function errorHandler(e: Error, c: Context) {
  console.error('Error occurred:', e);

  if (e instanceof ApiError) {
    return c.json(
      {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      },
      e.statusCode
    );
  }

  const isProd = httpEnv.NODE_ENV === 'production';

  // unknown error
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isProd ? 'An unexpected error occurred' : e.message,
      },
    },
    500
  );
}
