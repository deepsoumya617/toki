import type { PublicUser } from '@xd/db/schema/users';
import type { SessionPayload } from '@xd/shared';
import { webEnv } from '@xd/env/web';

export interface SessionResponse {
  session: SessionPayload<string> | null;
  user: PublicUser | null;
}

interface SessionApiResponse {
  success: boolean;
  data: SessionResponse;
}

/**
 * @desc fetches the current session and user data
 * @param {Object} options - optional fetch options
 * @param {Headers} options.headers - optional headers to include in the request
 * @return {Promise<SessionResponse>} the session and user data
 */
async function getSession(options?: {
  headers?: Headers;
}): Promise<SessionResponse> {
  try {
    const cookie = options?.headers?.get('cookie');
    if (!cookie) return { session: null, user: null };

    // fetch session data from the api
    const res = await fetch(
      `${webEnv.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        method: 'GET',
        headers: { cookie },
        cache: 'no-store',
      }
    );

    if (!res.ok) return { session: null, user: null };

    const body = (await res.json()) as SessionApiResponse;

    if (!body.success) return { session: null, user: null };

    return body.data ?? { session: null, user: null };
  } catch (error) {
    console.log('error: ', error);
    return { session: null, user: null };
  }
}

const auth = {
  api: {
    getSession,
  },
};

export default auth;
