import type { CreateRoomInput, RoomExpiryOption } from '@xd/shared';
import { rooms, type PublicRoom } from '@xd/db/schema/rooms';
import { roomMembers } from '@xd/db/schema/room-members';
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

/**
 * @desc handles room creation logic
 * @param {CreateRoomInput} input - the room creation input data
 * @param {string} userId - the id of the user creating the room
 * @return {Promise<PublicRoom>} - created room data
 */
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
