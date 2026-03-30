import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', [
  'online',
  'offline',
  'idle',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  user_name: varchar('username', { length: 50 }).notNull().unique(),
  display_name: varchar('display_name', { length: 100 }).notNull(),
  status: userStatusEnum('status').default('offline').notNull(),
  last_seen: timestamp('last_seen', { mode: 'string', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// export type
type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;
