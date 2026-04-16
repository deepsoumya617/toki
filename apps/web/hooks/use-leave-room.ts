'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { RoomsPage, SidebarRoomsCache } from '@/types/room';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

export default function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomClient.leaveRoom,
    onMutate: async roomId => {
      // cancel outgoing fetches first
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.all });

      // snapshot
      const prevSidebarRooms = queryClient.getQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar
      );
      const prevAllRooms = queryClient.getQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all
      );

      // remove from cache first -> server later, for optimistic updates
      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => {
          // no cache
          if (!old) return old;
          return {
            ...old,
            rooms: old.rooms.filter(room => room.id !== roomId),
          };
        }
      );

      queryClient.setQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all,
        old => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              allRooms: page.allRooms.filter(room => room.id !== roomId),
            })),
          };
        }
      );

      return { prevSidebarRooms, prevAllRooms };
    },
    onError: (_err, _roomId, ctx) => {
      queryClient.setQueryData(ROOMS_QUERY_KEY.sidebar, ctx?.prevSidebarRooms);
      queryClient.setQueryData(ROOMS_QUERY_KEY.all, ctx?.prevAllRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.all });
    },
  });
}
