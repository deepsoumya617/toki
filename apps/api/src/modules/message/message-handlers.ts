import { ForbiddenError, GoneError } from '../../lib/errors';
import { roomMembers } from '@xd/db/schema/room-members';
import type { Cursor } from '../room/room-handlers';
import { and, desc, eq, lt, or } from 'drizzle-orm';
import { messages } from '@xd/db/schema/messages';
import { rooms } from '@xd/db/schema/rooms';
import { db } from '@xd/db';

interface CreateMessageType {
  userId: string;
  roomId: string;
  content: string;
}

interface GetMessageType {
  userId: string;
  roomId: string;
  cursor?: Cursor;
  limit?: number;
}

export async function createMessageHandler({
  userId,
  roomId,
  content,
}: CreateMessageType) {
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

export async function getMessageHandler({
  userId,
  roomId,
  cursor,
  limit = 50,
}: GetMessageType) {
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

  // make conditions for pagination
  const conditions = [eq(messages.room_id, roomId)];

  if (cursor) {
    conditions.push(
      or(
        lt(messages.created_at, cursor.createdAt),
        and(
          eq(messages.created_at, cursor.createdAt),
          lt(messages.id, cursor.id)
        )
      )!
    );
  }

  const res = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.created_at), desc(messages.id))
    .limit(limit + 1);

  const hasNextPage = res.length > limit;
  const messagesData = hasNextPage ? res.slice(0, limit) : res;

  const lastMessage = messagesData.at(-1);
  const nextCursor =
    hasNextPage && lastMessage
      ? {
          created_at: lastMessage.created_at,
          id: lastMessage.id,
        }
      : null;

  return { allMessage: messagesData, nextCursor, hasNextPage };
}
