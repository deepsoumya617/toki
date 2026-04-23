'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import JoinRoomModal from '@/components/ui/join-room-modal';
import { useRoomsAll } from '@/hooks/use-rooms-all';
import { useRooms } from '@/hooks/use-rooms';
import { useEffect } from 'react';

export default function JoinRoomContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const router = useRouter();

  // check for the rooms in cache
  // it may fail though, because we dont have all the rooms in cache, at once
  const { data: rooms = [], isLoading: isSidebarLoading } = useRooms();
  const { data: allRoomsData, isLoading: isAllRoomsLoading } = useRoomsAll();

  const isLoading = isSidebarLoading || isAllRoomsLoading;

  const isAlreadyMember =
    rooms.some(room => room.id === roomId) ||
    (allRoomsData?.rooms.some(room => room.id === roomId) ?? false);

  useEffect(() => {
    if (isLoading) return;
    if (!roomId) {
      router.replace('/dashboard');
      return;
    }
    if (isAlreadyMember) {
      router.replace(`/dashboard/rooms/${roomId}`);
    }
  }, [isLoading, isAlreadyMember, roomId, router]);

  if (isLoading) return null;
  if (!roomId) return null;
  if (isAlreadyMember) return null;

  return <JoinRoomModal roomId={roomId} />;
}
