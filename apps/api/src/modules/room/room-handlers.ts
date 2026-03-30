import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import type { CreateRoomInput, RoomExpiryOption } from '@xd/shared';
import { rooms, type PublicRoom } from '@xd/db/schema/rooms';
import { roomMembers } from '@xd/db/schema/room-members';
import { and, desc, eq, lt, or } from 'drizzle-orm';
import { db } from '@xd/db';

export interface Cursor {
  id: string;
  createdAt: string;
}

const EXPIRY_TO_MS: Record<RoomExpiryOption, number | null> = {
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  never: null,
};

// get expiresat based on expiresIn value
function getExpiresAt(expiresIn: RoomExpiryOption): string | null {
  const durationMs = EXPIRY_TO_MS[expiresIn];
  if (durationMs === null) return null;

  return new Date(Date.now() + durationMs).toISOString();
}

// handle create room logic
export async function createRoomHandler(
  input: CreateRoomInput,
  userId: string
): Promise<PublicRoom> {
  const { name, password, expiresIn } = input;
  //hash password
  const hash = await Bun.password.hash(password, 'bcrypt');

  // calculate expires_at
  const expires_at = getExpiresAt(expiresIn);

  // create room + insert in room-members
  const room = await db.transaction(async tx => {
    const [createdRoom] = await tx
      .insert(rooms)
      .values({
        name,
        password: hash,
        owner_id: userId,
        expires_at,
      })
      .returning({
        id: rooms.id,
        name: rooms.name,
        owner_id: rooms.owner_id,
        expires_at: rooms.expires_at,
        created_at: rooms.created_at,
      });

    if (!createdRoom) throw new Error('Failed to create room');

    await tx.insert(roomMembers).values({
      room_id: createdRoom.id,
      user_id: userId,
    });

    return createdRoom;
  });

  return room;
}

// handle join room logic
export async function joinRoomHandler(
  roomId: string,
  password: string,
  userId: string
): Promise<PublicRoom> {
  // check room
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));

  if (!room) throw new NotFoundError('Room not found');

  if (room.expires_at && new Date(room.expires_at).getTime() <= Date.now()) {
    throw new NotFoundError('Room not found');
  }

  // validate password
  const isValidPassword = await Bun.password.verify(
    password,
    room.password,
    'bcrypt'
  );

  if (!isValidPassword) throw new UnauthorizedError('Invalid room password');

  // else..
  const [member] = await db
    .insert(roomMembers)
    .values({ room_id: roomId, user_id: userId })
    .onConflictDoNothing({ target: [roomMembers.room_id, roomMembers.user_id] })
    .returning({ id: roomMembers.id });

  if (!member) {
    throw new ConflictError('You are already a member of this room');
  }

  return {
    id: room.id,
    name: room.name,
    owner_id: room.owner_id,
    expires_at: room.expires_at,
    created_at: room.created_at,
  };
}

// get all rooms -> /rooms page
export async function getRoomsHandler(
  userId: string,
  cursor?: Cursor,
  limit = 10
) {
  // prepare the conditions array
  const conditions = [eq(roomMembers.user_id, userId)];

  if (cursor) {
    conditions.push(
      or(
        // < created_at
        lt(rooms.created_at, cursor.createdAt),
        and(
          // = created_at
          eq(rooms.created_at, cursor.createdAt),
          // compare the id
          lt(rooms.id, cursor.id)
        )
      )!
    );
  }

  const res = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      created_at: rooms.created_at,
      expires_at: rooms.expires_at,
      owner_id: rooms.owner_id,
      membersCount: db.$count(roomMembers, eq(roomMembers.room_id, rooms.id)),
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(and(...conditions))
    .orderBy(desc(rooms.created_at), desc(rooms.id))
    .limit(limit + 1);

  // limit = 10 -> i asked for 11 -> fetched 11 -> next page exists
  const hasNextPage = res.length > limit;
  const roomsData = hasNextPage ? res.slice(0, limit) : res;

  // get the next cursor
  const lastRoom = roomsData.at(-1);
  const nextCursor =
    hasNextPage && lastRoom
      ? {
          createdAt: lastRoom.created_at,
          id: lastRoom.id,
        }
      : null;

  return { allRooms: roomsData, nextCursor, hasNextPage };
}

// get all rooms for a member -> for sidebar
export async function getSidebarRoomsHandler(userId: string) {
  const allRooms = await db
    .select({
      id: rooms.id,
      name: rooms.name,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(eq(roomMembers.user_id, userId))
    .orderBy(desc(rooms.created_at))
    .limit(5);

  return allRooms;
}

// get room by id for a member
export async function getRoomByIdHandler(roomId: string, userId: string) {
  const [room] = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      owner_id: rooms.owner_id,
      expires_at: rooms.expires_at,
      created_at: rooms.created_at,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.room_id, rooms.id))
    .where(and(eq(roomMembers.user_id, userId), eq(rooms.id, roomId)));

  if (!room) throw new NotFoundError('Room not found');

  return room;
}

// leave room
export async function leaveRoomByIdHandler(roomId: string, userId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));

  if (!room) throw new NotFoundError('Room not found.');

  // check if user is owner
  // throw error for now
  // later we will delete the room and all the members if owner leaves
  if (userId === room.owner_id)
    throw new ConflictError('Room owner cannot leave the room');

  // check membership
  const [membership] = await db
    .select()
    .from(roomMembers)
    .where(
      and(eq(roomMembers.room_id, roomId), eq(roomMembers.user_id, userId))
    );

  if (!membership) throw new NotFoundError('You are not a member of this room');

  await db
    .delete(roomMembers)
    .where(
      and(eq(roomMembers.room_id, roomId), eq(roomMembers.user_id, userId))
    );
}
