import type { SignInInput, SignUpInput } from '@xd/shared';
import type { SessionResponse } from './auth';
import { parseApiError } from './api-error';
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
      console.log('error: ', error);
      return { session: null, user: null };
    }
  },
  // sign up
  signUp: async (input: SignUpInput) => {
    const res = await client.api.auth.signup.$post({ json: input });

    if (!res.ok) {
      throw await parseApiError(res, 'Sign up failed');
    }

    return await res.json();
  },
  // sign in
  signIn: async (input: SignInInput) => {
    const res = await client.api.auth.signin.$post({ json: input });

    if (!res.ok) {
      throw await parseApiError(res, 'Sign in failed');
    }

    return await res.json();
  },
  // log out
  logout: async () => {
    const res = await client.api.auth.logout.$post();

    if (!res.ok) {
      throw await parseApiError(res, 'Logout failed');
    }

    return await res.json();
  },
};
