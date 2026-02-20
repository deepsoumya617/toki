import { httpEnv } from '@xd/env/http';
import { redis } from './lib/redis';
import app from './app';

// export default {
//   port: httpEnv.PORT,
//   fetch: app.fetch,
// };

await redis.connect();

const server = Bun.serve({
  port: httpEnv.PORT,
  fetch: app.fetch,
});

console.log(`API server is running on http://localhost:${server.port}/api`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down API server...');
  server.stop(true);
  redis.close();

  console.log('API server stopped');
  process.exit(0);
});
