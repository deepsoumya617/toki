import type { ApiType } from '@apps/api/src/app.ts';
import { webEnv } from '@xd/env/web';
import { hc } from 'hono/client';

// export typed client
export const client = hc<ApiType>(webEnv.NEXT_PUBLIC_API_URL, {
  init: {
    credentials: 'include', // include cookies in requests
    mode: 'cors',
    cache: 'no-cache',
  },
});