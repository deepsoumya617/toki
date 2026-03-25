import type { CreateRoomInput } from '@xd/shared';
import { parseApiError } from './api-error';
import { client } from './client';

export const roomClient = {
  // get rooms
  getRooms: async (options?: { cookie?: string }) => {
    const res = await client.api.room.my.$get(undefined, {
      headers: options?.cookie ? { cookie: options.cookie } : {},
    });

    if (!res.ok) throw await parseApiError(res, 'Failed to fetch rooms');

    return await res.json();
  },

    // create room
    createRoom: async (input: CreateRoomInput) => {
      const res = await client.api.room.create.$post({ json: input });
      if (!res.ok) throw await parseApiError(res, 'Failed to create room');
      return await res.json();
    },
};
