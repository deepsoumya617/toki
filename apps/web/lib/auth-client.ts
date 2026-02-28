import type { SignInInput, SignUpInput } from '@xd/shared';
import type { SessionResponse } from './auth';
import { client } from './client';

interface ApiErrorResponse {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
  };
}

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
  signUp: async (input: SignUpInput) => {
    const res = await client.api.auth.signup.$post({ json: input });

    if (!res.ok) {
      const errorBody: ApiErrorResponse = await res.json();
      throw new Error(errorBody.error?.message ?? 'Sign up failed');
    }

    return await res.json();
  },
  // sign in
  signIn: async (input: SignInInput) => {
    const res = await client.api.auth.signin.$post({ json: input });

    if (!res.ok) {
      const errorBody: ApiErrorResponse = await res.json();
      throw new Error(errorBody.error?.message ?? 'Sign in failed');
    }

    return await res.json();
  },
  // log out
  logout: async () => {
    const res = await client.api.auth.logout.$post();

    if (!res.ok) {
      const errorBody: ApiErrorResponse = await res.json();
      throw new Error(errorBody.error?.message ?? 'Logout failed');
    }

    return await res.json();
  },
};
