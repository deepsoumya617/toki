import z from 'zod';

const contentSchema = z
  .string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(1000, 'Message is too long');

export const createMessageSchema = z.object({
  content: contentSchema,
});

export const updateMessageSchema = z.object({
  content: contentSchema,
});

export const messageIdParamSchema = z.object({
  messageId: z.uuid('Invalid message id'),
});

export const messageQuerySchema = z.object({
  createdAt: z.iso.datetime().optional(),
  id: z.uuid('Invalid room id').optional(),
  limit: z.coerce.number().max(10).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
