import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      mode: 'string',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [
    index('idx_rooms_owner_id').on(table.ownerId),
    index('idx_rooms_expires_at').on(table.expiresAt),
    // for pagination
    index('idx_rooms_created_at_id').on(table.createdAt, table.id),
  ]
);

// types
type Room = typeof rooms.$inferSelect;
export type PublicRoom = Omit<Room, 'password'>;
