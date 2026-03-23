'use client';

import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { SESSION_QUERY_KEY } from '@xd/shared';

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: authClient.getSession,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
  });
}
