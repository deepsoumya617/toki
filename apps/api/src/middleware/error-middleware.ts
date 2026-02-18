import { ApiError } from '../lib/errors';
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

  // unknown error
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
