/**
 * session middleware
 * checks for session token in cookise and validates it
 */
import type { HonoVariables } from '../modules/auth/auth-routes';
import { getSession } from '../lib/session-store';
import { UnauthorizedError } from '../lib/errors';
import { SESSION_COOKIE_NAME } from '@xd/shared';
import { users } from '@xd/db/schema/users';
import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { db } from '@xd/db';

export async function sessionMiddleware(
  c: Context<{ Variables: HonoVariables }>,
  next: Next
) {
  // get token from cookie
  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) throw new UnauthorizedError('No session token provided');

  // validate session
  const session = await getSession(token);

  // validate user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) throw new UnauthorizedError('Session is no loneger valid');

  // attach session to context
  c.set('session', session);

  await next();
}
