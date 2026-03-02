import z from 'zod';

const roomNameField = z
  .string()
  .trim()
  .min(1, 'Room name is required')
  .min(3, 'Room name must be at least 3 characters long')
  .max(64, 'Room name is too long');

const roomPasswordField = z
  .string()
  .trim()
  .min(1, 'Room password is required')
  .min(8, 'Room password must be at least 8 characters long')
  .max(128, 'Room password must be less than 128 characters long');

const inviteCodeField = z
  .string()
  .trim()
  .min(1, 'Invite code is required')
  .min(6, 'Invite code is too short')
  .max(20, 'Invite code is too long')
  .regex(
    /^[A-Za-z0-9_-]+$/,
    'Invite code can only contain letters, numbers, underscores, and hyphens'
  );

export const roomExpiryOptions = [
  '5m',
  '10m',
  '30m',
  '1h',
  '6h',
  '12h',
  '1d',
  '3d',
  '7d',
  'never',
] as const;

export const roomExpirySchema = z.enum(roomExpiryOptions);

const expiresInField = roomExpirySchema.optional().default('never');

export const createRoomSchema = z.object({
  name: roomNameField,
  password: roomPasswordField,
  expiresIn: expiresInField,
});

export const joinRoomSchema = z.object({
  inviteCode: inviteCodeField,
  password: roomPasswordField,
});

export const updateRoomSchema = z
  .object({
    name: roomNameField.optional(),
    password: roomPasswordField.optional(),
    expiresIn: roomExpirySchema.optional(),
  })
  .refine(
    input =>
      input.name !== undefined ||
      input.password !== undefined ||
      input.expiresIn !== undefined,
    {
      message: 'At least one field is required to update room',
    }
  );

export const roomIdParamSchema = z.object({
  roomId: z.uuid('Invalid room id'),
});

export const inviteCodeParamSchema = z.object({
  inviteCode: inviteCodeField,
});

// infer inputs
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomExpiryOption = z.infer<typeof roomExpirySchema>;
