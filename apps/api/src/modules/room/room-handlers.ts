import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import type { CreateRoomInput, RoomExpiryOption } from '@xd/shared';
import { rooms, type PublicRoom } from '@xd/db/schema/rooms';
import { roomMembers } from '@xd/db/schema/room-members';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@xd/db';

const EXPIRY_TO_MS: Record<RoomExpiryOption, number | null> = {
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
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

  // calculate expiresAt
  const expiresAt = getExpiresAt(expiresIn);

  // create room + insert in room-members
  const room = await db.transaction(async tx => {
    const [createdRoom] = await tx
      .insert(rooms)
      .values({
        name,
        password: hash,
        ownerId: userId,
        expiresAt,
      })
      .returning({
        id: rooms.id,
        name: rooms.name,
        ownerId: rooms.ownerId,
        expiresAt: rooms.expiresAt,
        createdAt: rooms.createdAt,
      });

    if (!createdRoom) throw new Error('Failed to create room');

    await tx.insert(roomMembers).values({
      roomId: createdRoom.id,
      userId,
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

  if (room.expiresAt && new Date(room.expiresAt).getTime() <= Date.now()) {
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
    .values({ roomId, userId })
    .onConflictDoNothing({ target: [roomMembers.roomId, roomMembers.userId] })
    .returning({ id: roomMembers.id });

  if (!member) {
    throw new ConflictError('You are already a member of this room');
  }

  return {
    id: room.id,
    name: room.name,
    ownerId: room.ownerId,
    expiresAt: room.expiresAt,
    createdAt: room.createdAt,
  };
}

// get all rooms for a member -> for sidebar
export async function getRoomsHandler(userId: string) {
  const allRooms = await db
    .select({
      id: rooms.id,
      name: rooms.name,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
    .where(eq(roomMembers.userId, userId))
    .orderBy(desc(rooms.createdAt))
    .limit(5);

  return allRooms;
}

// get room by id for a member
export async function getRoomByIdHandler(roomId: string, userId: string) {
  const [room] = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      ownerId: rooms.ownerId,
      expiresAt: rooms.expiresAt,
      createdAt: rooms.createdAt,
    })
    .from(roomMembers)
    .innerJoin(rooms, eq(roomMembers.roomId, rooms.id))
    .where(and(eq(roomMembers.userId, userId), eq(rooms.id, roomId)));

  if (!room) throw new NotFoundError('Room not found');

  return room;
}

// leaver room
export async function leaveRoomByIdHandler(roomId: string, userId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));

  if (!room) throw new NotFoundError('Room not found.');

  // check if user is owner
  // throw error for now
  // later we will delete the room and all the members if owner leaves
  if (userId === room.ownerId)
    throw new ConflictError('Room owner cannot leave the room');

  // check membership
  const [membership] = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));

  if (!membership) throw new NotFoundError('You are not a member of this room');

  await db
    .delete(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
}
