'use client';

import type { Cursor } from '@apps/api/src/modules/room/room-handlers';
import { useInfiniteQuery } from '@tanstack/react-query';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

export function useRoomsAll() {
  return useInfiniteQuery({
    queryKey: ROOMS_QUERY_KEY.all,
    queryFn: ({ pageParam }) =>
      roomClient.getRoomsAll({
        cursor: pageParam ?? undefined,
        limit: 10,
      }),
    initialPageParam: null as Cursor | null,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    select: data => ({
      rooms: data.pages.flatMap(page => page.allRooms),
      totalRooms: data.pages[0]?.totalRooms ?? 0,
      pageParams: data.pageParams,
    }),
  });
}
