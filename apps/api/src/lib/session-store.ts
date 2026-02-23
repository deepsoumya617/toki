// session store

import {
  REDIS_SESSION_PREFIX,
  REDIS_SESSION_TTL_SECONDS,
  SESSION_EXPIRY_SECONDS,
  SESSION_TOKEN_BYTES,
} from '@xd/shared';
import { sessions } from '@xd/db/schema/sessions';
import { UnauthorizedError } from './errors';
import { and, eq, gt } from 'drizzle-orm';
import { redis } from './redis';
import { db } from '@xd/db';

interface SessionPayload<TExpiresAt = Date> {
  sessionId: string;
  userId: string;
  expiresAt: TExpiresAt;
}

/**
 * create a session in the db, store in redis and
 * returns the token
 * @param {string} userId - the id of the user to create a session for
 * @returns {Promise<string>} the session token
 */
export async function createSession(userId: string): Promise<string> {
  const tokenBytes = new Uint8Array(SESSION_TOKEN_BYTES);
  crypto.getRandomValues(tokenBytes);
  const token = Buffer.from(tokenBytes).toString('base64url');

  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1000);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      token,
      expiresAt,
    })
    .returning({
      id: sessions.id,
      expiresAt: sessions.expiresAt,
    });

  if (!session) throw new Error('Failed to create session');

  const payload: SessionPayload = {
    sessionId: session.id,
    userId,
    expiresAt: session.expiresAt,
  };

  const redisKey = `${REDIS_SESSION_PREFIX}${token}`;
  await redis.set(redisKey, JSON.stringify(payload));
  await redis.expire(redisKey, REDIS_SESSION_TTL_SECONDS);

  return token;
}

/**
 * get session payload from redis using the token
 * @param {string} token = session token
 */
export async function getSession(token: string): Promise<SessionPayload> {
  const redisKey = `${REDIS_SESSION_PREFIX}${token}`;

  const session = await redis.get(redisKey);

  // cached
  if (session) {
    console.log('session cache hit');

    const sessionData: SessionPayload<string> = JSON.parse(session);
    const expiresAt = new Date(sessionData.expiresAt); // string -> Date

    if (Date.now() > expiresAt.getTime()) {
      await deleteSession(token);
      throw new UnauthorizedError('Session expired');
    }

    return {
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      expiresAt,
    };
  }

  // not cached, check db
  console.log('session cache miss');

  const [dbSession] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));

  if (!dbSession) {
    // not in redis, so dont delete from redis
    await deleteSession(token, { skipRedis: true });
    throw new UnauthorizedError('Session expired');
  }

  const sessionData: SessionPayload = {
    sessionId: dbSession.id,
    userId: dbSession.userId,
    expiresAt: dbSession.expiresAt,
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
