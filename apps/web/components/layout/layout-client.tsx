'use client';

import { PanelLeftOpenIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { LogoutButton } from '@/components/auth/logout-button';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { HugeiconsIcon } from '@hugeicons/react';
import { ScrollArea } from '../ui/scroll-area';
import { useEffect, useState } from 'react';
import { DmModal } from '../ui/dm-modal';

// demo rooms
const rooms: string[] = [
  'General',
  'Random',
  'Tech Talk',
  'Gaming',
  'Music',
  'Movies',
  'Sports',
  'Travel',
];

// demo dms
const dms = ['Manish', 'Shreya', 'Ma', 'Soumili'];

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // session
  const { data: session, isPending } = useSession();
  const hasSession = session?.session !== null && session?.user !== null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !hasSession) {
      router.replace('/sign-in');
    }
  }, [hasSession, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-md bg-stone-300 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <section className="h-dvh w-full select-none">
      <DmModal
        isOpen={isDmModalOpen}
        onClose={() => setIsDmModalOpen(false)}
        onSubmit={username => {
          console.log('Start DM with:', username);
        }}
      />

      <div className="mx-auto flex h-full w-full max-w-4xl overflow-hidden border border-stone-200 bg-white">
        <div
          className={`fixed inset-0 z-30 bg-black/40 md:hidden ${
            isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`fixed top-0 left-0 z-40 h-full w-72 border-r border-stone-200 bg-white md:static md:z-auto md:block md:h-full md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <h1 className="text-2xl font-pixel-square text-stone-900 px-4 py-3">
              Toki
            </h1>
            <div className="h-px shrink-0 bg-stone-300" />

            <div className="relative mx-4 my-3 border border-stone-200 bg-stone-50">
              <span className="absolute -top-1 -left-1 size-2 border border-stone-300 bg-white" />
              <span className="absolute -top-1 -right-1 size-2 border border-stone-300 bg-white" />
              <span className="absolute -bottom-1 -left-1 size-2 border border-stone-300 bg-white" />
              <span className="absolute -bottom-1 -right-1 size-2 border border-stone-300 bg-white" />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-pixel-square text-base font-medium text-stone-900">
                    {session?.user?.displayName}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    @{session?.user?.username}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="font-pixel-square text-2xl">Rooms</h1>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="h-5 w-5 cursor-pointer text-stone-900"
                  onClick={() => router.push('/dashboard/rooms/create')}
                />
              </div>
            </div>

            <div className="h-px shrink-0 bg-stone-300" />

            <div className="flex min-h-0">
              <div className="w-7 shrink-0 border-r border-stone-200 bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.08)_0,rgba(0,0,0,0.08)_1px,transparent_0,transparent_50%)] bg-size-[6px_6px]" />

              <div className="relative min-w-0 flex-1 border-x border-stone-200 bg-white">
                <span className="absolute -top-1 -left-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -top-1 -right-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -bottom-1 -left-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -bottom-1 -right-1 z-10 size-2 border border-stone-300 bg-stone-50" />

                {rooms.length > 0 ? (
                  <ScrollArea className="h-40">
                    <ul className="px-4 py-3">
                      {rooms.map((room, i) => (
                        <li key={i} className="py-0.5">
                          <a
                            href={`/dashboard/rooms/${room.toLowerCase()}`}
                            className="block text-sm font-medium text-stone-700 transition-transform duration-150 hover:scale-[1.02] hover:text-stone-900"
                          >
                            {room}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="px-4 py-3 text-sm text-stone-500 font-pixel-square">
                    No rooms available.{' '}
                    <span
                      className="text-stone-950 underline underline-offset-2 decoration-2 cursor-pointer"
                      onClick={() => router.push('/dashboard/rooms/create')}
                    >
                      Create
                    </span>
                  </p>
                )}
              </div>

              <div className="w-7 shrink-0 border-l border-stone-200 bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.08)_0,rgba(0,0,0,0.08)_1px,transparent_0,transparent_50%)] bg-size-[6px_6px]" />
            </div>

            <div className="h-px shrink-0 bg-stone-300" />

            <div className="px-4 py-3 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="font-pixel-square text-2xl">DMs</h1>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="h-5 w-5 cursor-pointer text-stone-900"
                  onClick={() => setIsDmModalOpen(true)}
                />
              </div>
            </div>

            <div className="h-px shrink-0 bg-stone-300" />

            <div className="flex min-h-0">
              <div className="w-7 shrink-0 border-r border-stone-200 bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.08)_0,rgba(0,0,0,0.08)_1px,transparent_0,transparent_50%)] bg-size-[6px_6px]" />

              <div className="relative min-w-0 flex-1 border-x border-stone-200 bg-white">
                <span className="absolute -top-1 -left-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -top-1 -right-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -bottom-1 -left-1 z-10 size-2 border border-stone-300 bg-stone-50" />
                <span className="absolute -bottom-1 -right-1 z-10 size-2 border border-stone-300 bg-stone-50" />

                {dms.length > 0 ? (
                  <ScrollArea className="h-40">
                    <ul className="px-4 py-3">
                      {dms.map((dm, i) => (
                        <li key={i} className="py-0.5">
                          <a
                            href={`/dashboard/rooms/${dm.toLowerCase()}`}
                            className="block text-sm font-medium text-stone-700"
                          >
                            {dm}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="px-4 py-3 text-sm text-stone-500 font-pixel-square">
                    No DMs available.{' '}
                    <span
                      className="text-stone-950 underline underline-offset-2 decoration-2 cursor-pointer"
                      onClick={() => setIsDmModalOpen(true)}
                    >
                      Start one
                    </span>
                  </p>
                )}
              </div>

              <div className="w-7 shrink-0 border-l border-stone-200 bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.08)_0,rgba(0,0,0,0.08)_1px,transparent_0,transparent_50%)] bg-size-[6px_6px]" />
            </div>

            <div className="h-px shrink-0 bg-stone-300" />

            <div className="mt-auto border-t border-stone-200 p-4">
              <LogoutButton className="h-9 w-full rounded-none bg-stone-900 font-pixel-square text-white hover:bg-stone-800" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-stone-200 px-3 py-3 md:hidden">
            <HugeiconsIcon
              icon={PanelLeftOpenIcon}
              className="h-5 w-5 cursor-pointer text-stone-900"
              onClick={() => setIsSidebarOpen(true)}
            />
            <p className="text-sm font-medium text-stone-500 font-pixel-square tracking-wide">
              {currentPath}
            </p>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}
