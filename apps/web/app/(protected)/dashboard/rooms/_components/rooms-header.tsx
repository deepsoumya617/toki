'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy01Icon,
  Edit01Icon,
  Logout02Icon,
  MeetingRoomIcon,
} from '@hugeicons/core-free-icons';
import UpdateRoomModal from '@/components/ui/update-room-modal';
import BackButton from '@/components/ui/back-button';
import { useRoomsAll } from '@/hooks/use-rooms-all';
import useLeaveRoom from '@/hooks/use-leave-room';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

type ActionItem =
  | {
      type: 'item';
      label: string;
      onClick: () => void;
      isDanger?: boolean;
      icon: typeof Copy01Icon;
    }
  | { type: 'separator' };

// action button
function ActionButton({
  roomId,
  isOwner,
  setIsUpdateRoomModalOpen,
}: {
  roomId?: string;
  isOwner?: boolean;
  setIsUpdateRoomModalOpen: () => void;
}) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const router = useRouter();

  const leaveRoomMutation = useLeaveRoom();

  // copy invite link
  const copyInviteLink = () => {
    if (!roomId) return;
    const link = `${window.location.origin}/dashboard/rooms/join?roomId=${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Copied invite link');
  };

  // leave room
  const handleLeaveRoom = () => {
    if (!roomId) return;

    leaveRoomMutation.mutate(roomId, {
      onSuccess: () => {
        setIsDropdownMenuOpen(false);
        toast.success('You left the room');
      },
      onError: error => {
        toast.error(error.message || 'Failed to leave room');
      },
    });
  };

  const items: ActionItem[] = [
    {
      type: 'item',
      label: 'Go to room',
      onClick: () => router.push(`/dashboard/rooms/${roomId}`),
      icon: MeetingRoomIcon,
    },
    {
      type: 'item',
      label: 'Copy invite link',
      onClick: copyInviteLink,
      icon: Copy01Icon,
    },
    ...(isOwner
      ? [
          {
            type: 'item' as const,
            label: 'Update room',
            onClick: () => setIsUpdateRoomModalOpen(),
            icon: Edit01Icon,
          },
        ]
      : []),
    { type: 'separator' },
    {
      type: 'item',
      label: 'Leave room',
      onClick: handleLeaveRoom,
      isDanger: true,
      icon: Logout02Icon,
    },
  ];

  return (
    <DropdownMenu
      open={isDropdownMenuOpen}
      onOpenChange={setIsDropdownMenuOpen}
    >
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="rounded-none cursor-pointer font-mono uppercase text-[14px] outline-none"
            disabled={!roomId}
          >
            Actions
            <ChevronDown
              size={14}
              className={
                isDropdownMenuOpen
                  ? 'rotate-180 transition-transform'
                  : 'transition-transform'
              }
            />
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-48 rounded-none shadow-md border-stone-200"
        align="end"
      >
        {items.map((item, idx) => {
          if (item.type == 'separator')
            return <DropdownMenuSeparator key={idx} />;

          return (
            <DropdownMenuItem
              key={idx}
              onClick={item.onClick}
              variant={item.isDanger ? 'destructive' : 'default'}
              className="cursor-pointer text-[14px] font-medium font-mono flex items-center uppercase"
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={1.8}
                className="size-3.5 shrink-0"
              />
              <span className="truncate">{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function RoomsHeader({ roomId }: { roomId: string | null }) {
  const [isUpdateRoomModalOpen, setIsUpdateRoomModalOpen] = useState(false);

  const { data } = useRoomsAll();

  const rooms = data?.rooms ?? [];

  const room = roomId ? rooms.find(room => room.id === roomId) : undefined;
  const isExpired = room?.expires_at
    ? new Date(room.expires_at).getTime() <= Date.now()
    : false;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUpdateRoomModalOpen) {
        setIsUpdateRoomModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isUpdateRoomModalOpen]);

  return (
    <>
      <UpdateRoomModal
        roomId={room?.id}
        isOpen={isUpdateRoomModalOpen}
        onClose={() => setIsUpdateRoomModalOpen(false)}
      />
      <BackButton href="/dashboard" />
      <div className="flex items-center justify-between mt-3 mb-8">
        <h1 className="text-2xl font-bold sm:font-semibold tracking-tight text-stone-900">
          Rooms
          <span className="text-lg ml-1 text-stone-500 font-medium">
            ({data?.totalRooms})
          </span>
        </h1>
        <ActionButton
          roomId={isExpired ? undefined : room?.id}
          isOwner={room?.isOwner}
          setIsUpdateRoomModalOpen={() => setIsUpdateRoomModalOpen(true)}
        />
      </div>
    </>
  );
}
