import {
  ForbiddenError,
  GoneError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import { roomMembers } from '@xd/db/schema/room-members';
import type { Cursor } from '../room/room-handlers';
import { and, desc, eq, lt, or } from 'drizzle-orm';
import { messages } from '@xd/db/schema/messages';
import { rooms } from '@xd/db/schema/rooms';
import { db } from '@xd/db';

interface BaseMessageInputType {
  userId: string;
  roomId: string;
}

interface CreateMessageType extends BaseMessageInputType {
  content: string;
}

interface GetMessageType extends BaseMessageInputType {
  cursor?: Cursor;
  limit?: number;
}

interface UpdateMessageType extends BaseMessageInputType {
  messageId: string;
  content: string;
}

interface DeleteMessageType extends BaseMessageInputType {
  messageId: string;
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
          id: lastMessage.id,
          createdAt: lastMessage.created_at,
        }
      : null;

  return { allMessage: messagesData, nextCursor, hasNextPage };
}

export async function updateMessageHandler({
  userId,
  roomId,
  messageId,
  content,
}: UpdateMessageType) {
  const [room] = await db
    .select({ expires_at: rooms.expires_at })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(
      and(eq(roomMembers.room_id, roomId), eq(roomMembers.user_id, userId))
    );

  if (!room)
    throw new ForbiddenError(
      'Room does not exist or you are not a member of this room'
    );

  if (room.expires_at && new Date().toISOString() > room.expires_at)
    throw new GoneError();

  // validate message
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.room_id, roomId)));

  // edge cases
  // -> message not found
  if (!message) throw new NotFoundError('Message not found');

  // -> system message
  if (message.type === 'system')
    throw new ForbiddenError('System messages can not be edited');

  // -> not owner
  if (message.user_id && message.user_id !== userId)
    throw new UnauthorizedError('You can not edit a message that is not yours');

  // -> deleted
  if (message.deleted_at)
    throw new ForbiddenError('Can not edit a deleted message');

  const [editedMessage] = await db
    .update(messages)
    .set({ content, is_edited: true })
    .where(eq(messages.id, message.id))
    .returning({
      id: messages.id,
      content: messages.content,
      created_at: messages.created_at,
    });

  if (!editedMessage) throw new Error('Failed to update message');

  return editedMessage;
}

export async function deleteMessageHandler({
  userId,
  roomId,
  messageId,
}: DeleteMessageType) {
  const [room] = await db
    .select({ expires_at: rooms.expires_at })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(
      and(eq(roomMembers.room_id, roomId), eq(roomMembers.user_id, userId))
    );

  if (!room)
    throw new ForbiddenError(
      'Room does not exist or you are not a member of this room'
    );

  if (room.expires_at && new Date().toISOString() > room.expires_at)
    throw new GoneError();

  // validate message
  const [message] = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.room_id, roomId)));

  // edge cases
  // -> message not found
  if (!message) throw new NotFoundError('Message not found');

  // -> system message
  if (message.type === 'system')
    throw new ForbiddenError('System messages can not be deleted');

  // -> not owner
  if (message.user_id && message.user_id !== userId)
    throw new UnauthorizedError(
      'You can not delete a message that is not yours'
    );

  // -> deleted
  if (message.deleted_at)
    throw new ForbiddenError('Can not delete a deleted message');

  const [deletedMessage] = await db
    .update(messages)
    .set({
      deleted_at: new Date().toISOString(),
    })
    .where(eq(messages.id, message.id))
    .returning({
      deleted_at: messages.deleted_at,
    });

  if (!deletedMessage || !deletedMessage.deleted_at)
    throw new Error('Failed to delete message');

  return;
}
