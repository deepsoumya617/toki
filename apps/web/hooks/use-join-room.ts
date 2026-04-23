'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SidebarRoom, SidebarRoomsCache } from '@/types/room';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

export default function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomClient.joinRoom,
    onSuccess: data => {
      // create room with the data
      // push into sidebar only for fast ui
      const sidebarRoom: SidebarRoom = {
        id: data.data.id,
        name: data.data.name,
      };

      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => {
          if (!old) return old;
          if (old.rooms.some(room => room.id === sidebarRoom.id)) return old;
          return {
            ...old,
            rooms: [sidebarRoom, ...old.rooms],
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.all });
    },
  });
}
