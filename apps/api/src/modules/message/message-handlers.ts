import { ForbiddenError, GoneError } from '../../lib/errors';
import { roomMembers } from '@xd/db/schema/room-members';
import { messages } from '@xd/db/schema/messages';
import { rooms } from '@xd/db/schema/rooms';
import { and, eq } from 'drizzle-orm';
import { db } from '@xd/db';

export async function createMessageHandler({
  userId,
  roomId,
  content,
}: {
  userId: string;
  roomId: string;
  content: string;
}) {
  const [room] = await db
    .select({
      expires_at: rooms.expires_at,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(
      and(eq(roomMembers.user_id, userId), eq(roomMembers.room_id, roomId))
    );

  if (!room)
    throw new ForbiddenError(
      'Room does not exist or you are not a member of this room'
    );

  if (room.expires_at && new Date().toISOString() > room.expires_at)
    throw new GoneError();

  const [message] = await db
    .insert(messages)
    .values({
      content,
      room_id: roomId,
      user_id: userId,
    })
    .returning({
      id: messages.id,
      content: messages.content,
      created_at: messages.created_at,
    });

  if (!message) throw new Error('Failed to create message.');

  return message;
}
