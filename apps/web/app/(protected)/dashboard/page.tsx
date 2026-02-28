'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { useSession } from '@/hooks/use-session';

export default function DashboardPage() {
  const { data, isLoading } = useSession();

  const user = data?.user ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-dvh">
        <p className="text-sm text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-12 space-y-3">
      <h1 className="text-sm uppercase font-medium font-mono">Dashboard</h1>
      <pre className="overflow-x-auto rounded-md border border-stone-200 bg-stone-50 p-4 text-xs text-stone-700 max-w-md">
        {JSON.stringify(user, null, 2)}
      </pre>
      <LogoutButton />
    </div>
  );
}
