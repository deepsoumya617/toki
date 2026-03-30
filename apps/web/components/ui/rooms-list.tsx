'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { useInView } from 'react-intersection-observer';
import { useRoomsAll } from '@/hooks/use-rooms-all';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

function formatDate(value: string | null) {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const absMs = Math.abs(diffMs);

  if (absMs < 30_000) return 'just now';

  const units = [
    { label: 'y', ms: 365 * 24 * 60 * 60 * 1000 },
    { label: 'mo', ms: 30 * 24 * 60 * 60 * 1000 },
    { label: 'w', ms: 7 * 24 * 60 * 60 * 1000 },
    { label: 'd', ms: 24 * 60 * 60 * 1000 },
    { label: 'h', ms: 60 * 60 * 1000 },
    { label: 'm', ms: 60 * 1000 },
    { label: 's', ms: 1000 },
  ] as const;

  const unit = units.find(u => absMs >= u.ms) ?? { label: 's', ms: 1000 };
  const amount = Math.floor(absMs / unit.ms);
  return diffMs < 0
    ? `${amount}${unit.label} ago`
    : `in ${amount}${unit.label}`;
}

function formatCreatedAt(value: string) {
  return formatRelativeTime(value);
}

function formatExpiresAt(value: string | null): {
  label: string;
  expired: boolean;
} {
  if (!value) return { label: 'Never', expired: false };
  const target = new Date(value).getTime();
  if (target < Date.now()) return { label: 'Expired', expired: true };
  return { label: formatRelativeTime(value), expired: false };
}

const COLS = 'grid-cols-[minmax(0,1fr)_2.75rem_5rem_5.5rem]';
const GAP = 'gap-x-6';

const HEADER_CELL =
  'text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-mono';

function RoleDot({ isOwner }: { isOwner: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              'size-2.5 shrink-0 cursor-default rounded-full border-[1.5px]',
              isOwner
                ? 'bg-amber-200 border-amber-500 dark:bg-amber-400 dark:border-amber-500'
                : 'bg-stone-300 border-stone-400 dark:bg-stone-500 dark:border-stone-600'
            )}
          />
        }
      />
      <TooltipContent className="px-2 py-1 text-xs font-mono uppercase">
        {isOwner ? 'Owner' : 'Member'}
      </TooltipContent>
    </Tooltip>
  );
}

function LoadingLine() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-1.5 w-14 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse"
        />
      ))}
    </div>
  );
}

export function RoomsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useRoomsAll();

  const { ref, inView } = useInView({ rootMargin: '200px' });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="border border-stone-200 bg-white dark:border-stone-800 dark:bg-background">
        <LoadingLine />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-400">
        Failed to load rooms: {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  const rooms = data?.rooms ?? [];

  return (
    <div className="border border-stone-200 bg-white dark:border-stone-800 dark:bg-background">
      <div
        className={cn(
          'hidden sm:grid',
          COLS,
          GAP,
          'px-4 py-2',
          'border-b border-stone-200 dark:border-stone-800',
          'bg-stone-50 dark:bg-stone-900/60'
        )}
      >
        <p className={HEADER_CELL}>Room</p>
        <p className={cn(HEADER_CELL, 'text-right')}>Mem</p>
        <p className={cn(HEADER_CELL, 'text-right')}>Created</p>
        <p className={HEADER_CELL}>Expires</p>
      </div>

      <div className="max-h-[62vh] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80">
        {rooms.length > 0 ? (
          rooms.map(room => {
            const expires = formatExpiresAt(room.expires_at);

            return (
              <div
                key={room.id}
                className="px-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/40"
              >
                <div className="flex items-center gap-3 py-3 sm:hidden">
                  <RoleDot isOwner={room.isOwner} />
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-medium text-stone-900 dark:text-stone-100"
                      title={room.name}
                    >
                      {room.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {room.membersCount} member
                      {room.membersCount !== 1 ? 's' : ''}
                      {' · '}
                      {formatCreatedAt(room.created_at)}
                      {' · '}
                      <span
                        className={
                          expires.expired
                            ? 'text-red-500 dark:text-red-400'
                            : ''
                        }
                      >
                        {expires.label}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={cn('hidden sm:grid items-center py-3', COLS, GAP)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <RoleDot isOwner={room.isOwner} />
                    <p
                      className="truncate text-sm font-medium text-stone-900 dark:text-stone-100"
                      title={room.name}
                    >
                      {room.name}
                    </p>
                  </div>

                  <p className="text-right text-xs tabular-nums text-stone-500 dark:text-stone-400">
                    {room.membersCount}
                  </p>

                  <p
                    className="text-right text-xs tabular-nums text-stone-500 dark:text-stone-400"
                    title={formatDate(room.created_at)}
                  >
                    {formatCreatedAt(room.created_at)}
                  </p>

                  <p
                    className={cn(
                      'text-xs',
                      expires.expired
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-stone-500 dark:text-stone-400'
                    )}
                    title={
                      room.expires_at ? formatDate(room.expires_at) : 'Never'
                    }
                  >
                    {expires.label}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="px-4 py-8 text-center text-sm text-stone-400 dark:text-stone-500">
            No rooms found.
          </p>
        )}

        <div ref={ref}>
          {isFetchingNextPage && <LoadingLine />}
          {!hasNextPage && rooms.length > 0 && (
            <p className="px-4 py-3 text-center text-xs text-stone-400 dark:text-stone-500 font-mono">
              · end ·
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
