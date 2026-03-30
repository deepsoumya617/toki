'use client';

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { Cursor } from '@apps/api/src/modules/room/room-handlers';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

interface Room {
  id: string;
  name: string;
  membersCount: number;
  createdAt: string;
  expiresAt: string | null;
  isOwner: boolean;
}

interface SidebarRoom {
  id: string;
  name: string;
}

interface SidebarRoomsCache {
  success: boolean;
  rooms: SidebarRoom[];
}

interface RoomsPage {
  allRooms: Room[];
  nextCursor: Cursor | null;
  hasNextPage: boolean;
}

// optimistic update -> update the cache before the mutation is successful
export default function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomClient.createRoom,
    onMutate: async input => {
      // cancel outgoing fetches
      // sidebar
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      // all rooms
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY.all });

      // take a snapshot of prev value
      const prevSidebarRooms = queryClient.getQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar
      );

      const prevAllRooms = queryClient.getQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all
      );

      // create fake room
      const fakeSidebarRoom: SidebarRoom = {
        id: `temp-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        name: input.name,
      };

      const fakeRoom: Room = {
        id: fakeSidebarRoom.id,
        name: fakeSidebarRoom.name,
        membersCount: 1,
        isOwner: true,
        createdAt: new Date().toISOString(),
        expiresAt: input.expiresIn,
      };

      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => ({
          success: true,
          rooms: old ? [fakeSidebarRoom, ...old.rooms] : [fakeSidebarRoom],
        })
      );

      queryClient.setQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all,
        old => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? { ...page, allRooms: [fakeRoom, ...page.allRooms] }
                : page
            ),
          };
        }
      );

      return { prevSidebarRooms, prevAllRooms, fakeSidebarRoom, fakeRoom };
    },
    onError: (_err, _input, ctx) => {
      // rollback to prev value
      queryClient.setQueryData(ROOMS_QUERY_KEY.sidebar, ctx?.prevSidebarRooms);
      queryClient.setQueryData(ROOMS_QUERY_KEY.all, ctx?.prevAllRooms);
    },
    onSuccess: (data, _input, ctx) => {
      // replace fake room with real room
      const sidebarRoom: SidebarRoom = {
        id: data.data.id,
        name: data.data.name,
      };

      const allRoom: Room = {
        id: data.data.id,
        name: data.data.name,
        isOwner: true,
        createdAt: data.data.created_at,
        membersCount: 1,
        expiresAt: data.data.expires_at,
      };

      // sidebar cache
      queryClient.setQueryData<SidebarRoomsCache>(
        ROOMS_QUERY_KEY.sidebar,
        old => {
          if (!old) return old;
          return {
            success: true,
            rooms: old.rooms.map(room =>
              room.id === ctx?.fakeSidebarRoom.id ? sidebarRoom : room
            ),
          };
        }
      );

      // /room cache
      queryClient.setQueryData<InfiniteData<RoomsPage>>(
        ROOMS_QUERY_KEY.all,
        old => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              allRooms: page.allRooms.map(room =>
                room.id === ctx.fakeRoom.id ? allRoom : room
              ),
            })),
          };
        }
      );
    },
    onSettled: () => {
      // invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.sidebar });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY.all });
    },
  });
}
