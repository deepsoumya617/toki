/**
 * session middleware
 * checks for session token in cookise and validates it
 */

import type { HonoVariables } from '../modules/auth/auth-routes';
import { getSession } from '../lib/session-store';
import { UnauthorizedError } from '../lib/errors';
import { SESSION_COOKIE_NAME } from '@xd/shared';
import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';

export async function sessionMiddleware(
  c: Context<{ Variables: HonoVariables }>,
  next: Next
) {
  // get token from cookie
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) throw new UnauthorizedError('No session token provided');

  // validate session
  const session = await getSession(token);

  // attach session to context
  c.set('session', session);

  await next();
}
