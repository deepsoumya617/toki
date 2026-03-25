'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

interface SidebarRoom {
  id: string;
  name: string;
}

interface SidebarRoomsCache {
  success: boolean;
  rooms: SidebarRoom[];
}

// optimistic update -> update the cache before the mutation is successful
export default function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomClient.createRoom,
    onMutate: async input => {
      // cancel outgoing fetches
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });

      // take a snapshot of prev value
      const prevRooms = queryClient.getQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar
      );

      // create fake room
      const fakeRoom = {
        id: `temp-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        name: input.name,
      };

      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => ({
          success: true,
          rooms: old ? [fakeRoom, ...old.rooms] : [fakeRoom],
        })
      );

      return { prevRooms, fakeRoom };
    },
    onError: (_err, _input, ctx) => {
      // rollback to prev value
      queryClient.setQueryData(ROOMS_QUERY_KEY.sidebar, ctx?.prevRooms);
    },
    onSuccess: (data, _input, ctx) => {
      // replace fake room with real room
      const createdRoom: SidebarRoom = {
        id: data.data.id,
        name: data.data.name,
      };

      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => {
          if (!old) return old;
          return {
            success: true,
            rooms: old.rooms.map(room =>
              room.id === ctx?.fakeRoom.id ? createdRoom : room
            ),
          };
        }
      );
    },
    onSettled: () => {
      // invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
    },
  });
}
