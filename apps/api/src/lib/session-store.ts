// session store

import {
  REDIS_SESSION_PREFIX,
  REDIS_SESSION_TTL_SECONDS,
  SESSION_EXPIRY_SECONDS,
  SESSION_TOKEN_BYTES,
} from '@xd/shared';
import { sessions } from '@xd/db/schema/sessions';
import { redis } from './redis';
import { db } from '@xd/db';

interface SessionPayload {
  sessionId: string;
  userId: string;
  expiresAt: Date;
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
