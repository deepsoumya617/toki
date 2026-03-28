import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ProtectedLayoutClient from '@/components/layout/layout-client';
import { ROOMS_QUERY_KEY, SESSION_QUERY_KEY } from '@xd/shared';
import auth, { type SessionResponse } from '@/lib/auth';
import { roomClient } from '@/lib/room-client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // create query client
  const queryClient = new QueryClient();

  // get headers
  const h = await headers();

  // fetch session on server
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  await queryClient.prefetchQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => auth.api.getSession({ headers: h }),
  });

  // fetch rooms
  await queryClient.prefetchQuery({
    queryKey: ROOMS_QUERY_KEY.sidebar,
    queryFn: () => roomClient.getRoomsSidebar({ cookie: h.get('cookie') || '' }),
  });

  const session = queryClient.getQueryData<SessionResponse>(SESSION_QUERY_KEY);

  // redirect on /sign-in if session = null
  const hasSession = session?.session !== null && session?.user !== null;

  if (!hasSession) return redirect('/sign-in');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
    </HydrationBoundary>
  );
}
