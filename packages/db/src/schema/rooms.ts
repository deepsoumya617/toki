import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    owner_id: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expires_at: timestamp('expires_at', {
      mode: 'string',
      withTimezone: true,
    }),
    created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [
    index('idx_rooms_owner_id').on(table.owner_id),
    index('idx_rooms_expires_at').on(table.expires_at),
    // for pagination
    // fetch latest rooms first -> avoid reverse scan
    index('idx_rooms_created_at_id').on(
      table.created_at.desc(),
      table.id.desc()
    ),
  ]
);

// types
type Room = typeof rooms.$inferSelect;
export type PublicRoom = Omit<Room, 'password'>;
