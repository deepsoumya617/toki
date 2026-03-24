import { parseApiError } from './api-error';
import { client } from './client';

export const roomClient = {
  getRooms: async (options?: { cookie?: string }) => {
    const res = await client.api.room.my.$get(undefined, {
      headers: options?.cookie ? { cookie: options.cookie } : {},
    });

    if (!res.ok) throw await parseApiError(res, 'Failed to fetch rooms');

    return await res.json();
  },
};
