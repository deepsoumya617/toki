import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { rooms } from './rooms';

export const messageTypeEnum = pgEnum('message_type', ['user', 'system']);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    room_id: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    type: messageTypeEnum('type').notNull().default('user'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
    edited_at: timestamp('edited_at'),
  },
  table => [
    index('idx_messages_room_id_created_at').on(
      table.room_id,
      table.created_at
    ),
    index('idx_messages_user_id').on(table.user_id),
  ]
);
