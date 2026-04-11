import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expires_at: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
  },
  // indexes keyword = WHERE, ORDER BY, JOIN etc
  // unique, primary key = auto indexed
  table => [
    index('sessions_user_id_idx').on(table.user_id),
    index('sessions_expires_at_idx').on(table.expires_at),
  ]
);
