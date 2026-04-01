import type { Cursor } from '@apps/api/src/modules/room/room-handlers';
import type { CreateRoomInput, JoinRoomInput } from '@xd/shared';
import { parseApiError } from './api-error';
import { client } from './client';

export const roomClient = {
  // get rooms for sidebar
  getRoomsSidebar: async (options?: { cookie?: string }) => {
    const res = await client.api.rooms.my.sidebar.$get(undefined, {
      headers: options?.cookie ? { cookie: options.cookie } : {},
    });

    if (!res.ok) throw await parseApiError(res, 'Failed to fetch rooms');

    return await res.json();
  },

  // /rooms page
  getRoomsAll: async ({
    cursor,
    limit,
    cookie,
  }: {
    cursor?: Cursor;
    limit?: number;
    cookie?: string;
  }) => {
    const res = await client.api.rooms.my.$get(
      {
        query: {
          id: cursor?.id,
          createdAt: cursor?.createdAt,
          limit: limit?.toString(),
        },
      },
      { headers: cookie ? { cookie } : {} }
    );

    if (!res.ok) throw await parseApiError(res, 'Failed to fetch rooms');

    return await res.json();
  },

  // create room
  createRoom: async (input: CreateRoomInput) => {
    const res = await client.api.rooms.create.$post({ json: input });
    if (!res.ok) throw await parseApiError(res, 'Failed to create room');
    return await res.json();
  },

  // join room
  joinRoom: async (roomId: string, input: JoinRoomInput) => {
    const res = await client.api.rooms[':roomId'].join.$post({
      param: {
        roomId,
      },
      json: input,
    });

    if (!res.ok) throw await parseApiError(res, 'Failed to join room');

    return await res.json();
  },
};
