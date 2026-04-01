'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu';
import {
  Edit02Icon,
  Logout01Icon,
  Share03Icon,
} from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { useInView } from 'react-intersection-observer';
import { useRoomsAll } from '@/hooks/use-rooms-all';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

function copyInviteLink(roomId: string) {
  const link = `${window.location.origin}/dashboard/rooms/join?roomId=${roomId}`;
  navigator.clipboard
    .writeText(link)
    .then(() => toast.success('Invite link copied!'))
    .catch(() => toast.error('Failed to copy invite link'));
}

const COLS = 'grid-cols-[minmax(0,14rem)_2.75rem_5.5rem_5.5rem]';
const GAP = 'gap-x-6';

const HEADER_CELL =
  'text-[10px] font-semibold uppercase tracking-wider text-stone-500 font-mono';

function RoleDot({ isOwner }: { isOwner: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              'size-2.5 shrink-0 cursor-default rounded-full border-[1.5px]',
              isOwner
                ? 'bg-amber-200 border-amber-500'
                : 'bg-stone-300 border-stone-400'
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
          className="h-1.5 w-14 rounded-full bg-stone-200 animate-pulse"
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
      <div className="mt-10 border border-stone-200 bg-white">
        <LoadingLine />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load rooms: {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  const rooms = data?.rooms ?? [];

  return (
    <div className="mt-10 border border-stone-200 bg-white">
      <div
        className={cn(
          'hidden sm:grid',
          COLS,
          GAP,
          'px-4 py-2',
          'border-b border-stone-200',
          'bg-stone-50'
        )}
      >
        <p className={HEADER_CELL}>Room</p>
        <p className={cn(HEADER_CELL, 'text-right')}>Mem</p>
        <p className={cn(HEADER_CELL, 'text-center')}>Created</p>
        <p className={cn(HEADER_CELL, 'text-center')}>Expires</p>
      </div>

      <div className="max-h-[62vh] overflow-y-auto divide-y divide-stone-100">
        {rooms.length > 0 ? (
          rooms.map(room => {
            const expires = formatExpiresAt(room.expires_at);

            return (
              <ContextMenu key={room.id}>
                <ContextMenuTrigger>
                  <div className="px-4 transition-colors hover:bg-stone-50">
                    <div className="flex items-center gap-3 py-3 sm:hidden">
                      <RoleDot isOwner={room.isOwner} />
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-stone-900"
                          title={room.name}
                        >
                          {room.name}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-600">
                          {room.membersCount} member
                          {room.membersCount !== 1 ? 's' : ''}
                          {' · '}
                          {formatCreatedAt(room.created_at)}
                          {' · '}
                          <span
                            className={expires.expired ? 'text-red-500' : ''}
                          >
                            {expires.label}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'hidden sm:grid items-center py-3',
                        COLS,
                        GAP
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RoleDot isOwner={room.isOwner} />
                        <p
                          className="truncate text-sm font-medium text-stone-900"
                          title={room.name}
                        >
                          {room.name}
                        </p>
                      </div>

                      <p className="text-right text-xs tabular-nums text-stone-600 font-medium">
                        {room.membersCount}
                      </p>

                      <p
                        className="text-center text-xs tabular-nums text-stone-600 font-medium"
                        title={formatDate(room.created_at)}
                      >
                        {formatCreatedAt(room.created_at)}
                      </p>

                      <p
                        className={cn(
                          'text-center text-xs font-medium',
                          expires.expired ? 'text-red-500' : 'text-stone-600'
                        )}
                        title={
                          room.expires_at
                            ? formatDate(room.expires_at)
                            : 'Never'
                        }
                      >
                        {expires.label}
                      </p>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-60 border-0 bg-transparent p-0 shadow-none ring-0">
                  <div className="relative mx-4 my-3 border border-stone-200 bg-white shadow-xs p-1">
                    <ContextMenuGroup>
                      <ContextMenuItem onClick={() => copyInviteLink(room.id)}>
                        <HugeiconsIcon icon={Share03Icon} strokeWidth={1.8} />
                        Invite link
                      </ContextMenuItem>

                      <ContextMenuItem
                        onClick={() =>
                          toast.info('Update room action will be added soon')
                        }
                      >
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.8} />
                        Update room
                      </ContextMenuItem>
                    </ContextMenuGroup>

                    <ContextMenuSeparator />

                    <ContextMenuGroup>
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() =>
                          toast.info('Leave room action will be added soon')
                        }
                      >
                        <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.8} />
                        Leave room
                      </ContextMenuItem>
                    </ContextMenuGroup>
                  </div>
                </ContextMenuContent>
              </ContextMenu>
            );
          })
        ) : (
          <p className="px-4 py-8 text-center text-sm text-stone-400">
            No rooms found.
          </p>
        )}

        <div ref={ref}>
          {isFetchingNextPage && <LoadingLine />}
          {!hasNextPage && rooms.length > 0 && (
            <p className="px-4 py-3 text-center text-xs text-stone-400 font-mono">
              · end ·
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
