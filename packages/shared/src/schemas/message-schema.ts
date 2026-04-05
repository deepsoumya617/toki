import z from 'zod';

export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long'),
});

export const messageIdParamSchema = z.object({
  messageId: z.uuid('Invalid message id'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
