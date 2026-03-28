import { useQuery } from '@tanstack/react-query';
import { roomClient } from '@/lib/room-client';
import { ROOMS_QUERY_KEY } from '@xd/shared';

export function useRooms() {
  return useQuery({
    queryKey: ROOMS_QUERY_KEY.sidebar,
    queryFn: () => roomClient.getRoomsSidebar(),
    select: data => data.rooms,
    staleTime: 60 * 1000,
  });
}
