'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { RoomsPage, SidebarRoomsCache } from '@/types/room';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

export default function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomClient.updateRoom,
    onMutate: async ({ roomId, input }) => {
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.all });

      const prevSidebarRooms = queryClient.getQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar
      );
      const prevAllrooms = queryClient.getQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all
      );

      // just update the name optimistically
      if (input.name) {
        queryClient.setQueryData<SidebarRoomsCache>(
          ROOMS_QUERY_KEY.sidebar,
          old => {
            if (!old) return old;
            return {
              ...old,
              rooms: old.rooms.map(room =>
                room.id === roomId ? { ...room, name: input.name! } : room
              ),
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
                allRooms: page.allRooms.map(room =>
                  room.id === roomId ? { ...room, name: input.name! } : room
                ),
              })),
            };
          }
        );
      }

      return { prevSidebarRooms, prevAllrooms };
    },
    onError: (_err, _input, ctx) => {
      queryClient.setQueryData(ROOMS_QUERY_KEY.sidebar, ctx?.prevSidebarRooms);
      queryClient.setQueryData(ROOMS_QUERY_KEY.all, ctx?.prevAllrooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.all });
    },
  });
}
