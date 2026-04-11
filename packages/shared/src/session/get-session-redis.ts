import type { SessionPayload } from '../types/auth-types';
import type { RedisClient } from 'bun';

interface GetSessionInput {
  redis: RedisClient;
  redisKey: string;
}

// check session in redis -> use in api/ ws/
// if not found -> return null
export async function getSessionFromRedis({
  redis,
  redisKey,
}: GetSessionInput): Promise<SessionPayload | null> {
  const session = await redis.get(redisKey);

  // no session
  if (!session) return null;

  // session
  const sessionData: SessionPayload = JSON.parse(session);
  const expiresAt = new Date(sessionData.expiresAt);

  if (Date.now() > expiresAt.getTime()) {
    await redis.del(redisKey);
    return null;
  }

  return {
    sessionId: sessionData.sessionId,
    userId: sessionData.userId,
    expiresAt: sessionData.expiresAt,
  };
}
