import { index, pgTable, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { rooms } from './rooms';

export const roomMembers = pgTable(
  'room_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  table => [
    unique('uq_room_members_room_id_user_id').on(table.roomId, table.userId),
    index('idx_room_members_room_id').on(table.roomId),
    index('idx_room_members_user_id').on(table.userId),
  ]
);
