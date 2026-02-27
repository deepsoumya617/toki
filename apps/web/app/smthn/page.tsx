'use client';

import { useSession } from '@/hooks/use-session';

export default function SmthnPage() {
  // test usesession hook
  const { data, isPending } = useSession();

  if (isPending) {
    return (
      <div className="p-4">
        <h1 className="text-sm uppercase text-center font-medium font-mono">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-sm uppercase text-center font-medium font-mono">
        {data?.user?.email ? `Logged in as ${data.user.email}` : 'Not logged in'}
      </h1>
    </div>
  );
}
