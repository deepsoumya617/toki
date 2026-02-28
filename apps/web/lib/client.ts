import type { ApiType } from '@apps/api/src/app.ts';
import { webEnv } from '@xd/env/web';
import { hc } from 'hono/client';

function getApiBaseUrl() {
  const configured = webEnv.NEXT_PUBLIC_API_URL;

  if (typeof window === 'undefined') return configured;

  try {
    const url = new URL(configured);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = window.location.hostname;
      return url.toString();
    }

    return configured;
  } catch {
    return configured;
  }
}

// export typed client
export const client = hc<ApiType>(getApiBaseUrl(), {
  init: {
    credentials: 'include', // include cookies in requests
    mode: 'cors',
    cache: 'no-cache',
  },
});
