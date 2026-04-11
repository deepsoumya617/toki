import { wsEnv } from '@xd/env/ws';
import { RedisClient } from 'bun';

export const redis = new RedisClient(wsEnv.REDIS_URL);

// connection events
redis.onconnect = () => {
  console.log('Connected to Redis');
};

redis.onclose = () => {
  console.log('Redis connection closed');
};