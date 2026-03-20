import ProtectedLayoutClient from '@/components/layout/layout-client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import auth from '@/lib/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // fetch session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // redirect on /sign-in if session = null
  const hasSession = session.session !== null && session.user !== null;

  if (!hasSession) return redirect('/sign-in');

  return (
    <ProtectedLayoutClient session={session}>{children}</ProtectedLayoutClient>
  );
}
