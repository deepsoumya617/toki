import { httpEnv } from '@xd/env/http';
import app from './app';

// export default {
//   port: httpEnv.PORT,
//   fetch: app.fetch,
// };

const server = Bun.serve({
  port: httpEnv.PORT,
  fetch: app.fetch,
});

console.log(`API server is running on http://localhost:${server.port}`);

// Graceful shutdown -> later