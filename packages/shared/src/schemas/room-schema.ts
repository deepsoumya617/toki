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

export const roomExpiryOptions = [
  '10m',
  '30m',
  '1h',
  '6h',
  '12h',
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

// infer inputs
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomExpiryOption = z.infer<typeof roomExpirySchema>;
