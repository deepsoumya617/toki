import { httpEnv } from '@xd/env/http';
import { RedisClient } from 'bun';

export const redis = new RedisClient(httpEnv.REDIS_URL);

// connection events
redis.onconnect = () => {
  console.log('Connected to Redis');
};

redis.onclose = () => {
  console.log('Redis connection closed');
};
