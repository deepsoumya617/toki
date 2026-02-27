import type { SignUpInput } from '@xd/shared';
import type { SessionResponse } from './auth';
import { client } from './client';

export const authClient = {
  // get session
  getSession: async (): Promise<SessionResponse> => {
    try {
      // rpc
      const res = await client.api.auth['get-session'].$get();

      if (!res.ok) return { session: null, user: null };

      const body = await res.json();
      if (!body.success) return { session: null, user: null };

      return body.data ?? { session: null, user: null };
    } catch (error) {
      return { session: null, user: null };
    }
  },
  // sign up
  signUp: async (input: SignUpInput) => {},
};
