// session store

import {
  getSessionFromRedis,
  REDIS_SESSION_PREFIX,
  REDIS_SESSION_TTL_SECONDS,
  SESSION_EXPIRY_SECONDS,
  SESSION_TOKEN_BYTES,
  type SessionPayload,
} from '@xd/shared';
import { sessions } from '@xd/db/schema/sessions';
import { UnauthorizedError } from './errors';
import { eq } from 'drizzle-orm';
import { redis } from './redis';
import { db } from '@xd/db';

/**
 * create a session in the db, store in redis and
 * returns the token
 */
export async function createSession(userId: string): Promise<string> {
  const tokenBytes = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(tokenBytes);
  const token = Buffer.from(tokenBytes).toString('base64url');

  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_SECONDS * 1000
  ).toISOString();

  const [session] = await db
    .insert(sessions)
    .values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    })
    .returning({
      id: sessions.id,
      expires_at: sessions.expires_at,
    });

  if (!session) throw new Error('Failed to create session');

  const payload: SessionPayload = {
    sessionId: session.id,
    userId,
    expiresAt: session.expires_at,
  };

  const redisKey = `${REDIS_SESSION_PREFIX}${token}`;
  await redis.set(redisKey, JSON.stringify(payload));
  await redis.expire(redisKey, REDIS_SESSION_TTL_SECONDS);

  return token;
}

/**
 * get session payload from redis using the token
 * @param {string} token session token
 */
export async function getSession(token: string): Promise<SessionPayload> {
  const redisKey = `${REDIS_SESSION_PREFIX}${token}`;

  const session = await getSessionFromRedis({ redis, redisKey });

  if (session) return session;

  // not in redis
  const [dbSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));

  if (!dbSession) throw new UnauthorizedError('Invalid session');

  if (dbSession.expires_at <= new Date().toISOString()) {
    await deleteSession(token, { skipRedis: true });
    throw new UnauthorizedError('Session expired');
  }

  const sessionData: SessionPayload = {
    sessionId: dbSession.id,
    userId: dbSession.user_id,
    expiresAt: dbSession.expires_at,
  };

  // cache in redis
  await redis.set(redisKey, JSON.stringify(sessionData));
  await redis.expire(redisKey, REDIS_SESSION_TTL_SECONDS);

  return sessionData;
}

/**
 * delete session from db and redis
 * @param {string} token - session token to delete
 */
export async function deleteSession(
  token: string,
  ops: { skipRedis?: boolean } = {}
) {
  if (!ops.skipRedis) await redis.del(`${REDIS_SESSION_PREFIX}${token}`);
  await db.delete(sessions).where(eq(sessions.token, token));
}
