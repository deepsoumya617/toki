// handles auth related logic like signup, login...

import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import { createSession, deleteSession } from '../../lib/session-store';
import { type LogInInput, type SignUpInput } from '@xd/shared';
import { users } from '@xd/db/schema/users';
import { eq, or } from 'drizzle-orm';
import { db } from '@xd/db';

/**
 * @desc handles signup logic
 * @param {SignUpInput} input - the signup input data
 * @return {Promise<string>} the session token
 */
export async function signUpHandler(input: SignUpInput): Promise<string> {
  const { email, username, password, displayName } = input;

  // check for conflicts
  const [existingUser] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)));

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ConflictError('an account with this info already exists');
    }
    if (existingUser.username === username) {
      throw new ConflictError('username already taken');
    }
  }

  // hash password
  const hash = await Bun.password.hash(password, 'bcrypt');

  // create user in db
  const [user] = await db
    .insert(users)
    .values({
      email,
      username,
      password: hash,
      displayName,
    })
    .returning({
      id: users.id,
    });

  if (!user) throw new Error('Failed to create user');

  // create session and return token
  return await createSession(user.id);
}

/**
 * @desc handles login logic
 * @param {LogInInput} input - the login input data
 * @return {Promise<string>} the session token
 */
export async function logInHandler(input: LogInInput): Promise<string> {
  const { email, password } = input;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) throw new UnauthorizedError('Invalid email or password');

  const isValidPassword = await Bun.password.verify(
    password,
    user.password,
    'bcrypt'
  );

  if (!isValidPassword)
    throw new UnauthorizedError('Invalid email or password');

  // create session and return token
  return await createSession(user.id);
}

/**
 * @desc handles logout logic
 * @param {string} token - the session token to invalidate
 * @return {Promise<void>}
 */
export async function logoutHandler(token: string): Promise<void> {
  await deleteSession(token);
}

/**
 * @desc get current user logic
 * @param {string} userId - the id of the user to fetch
 * @return {Promise<{id: string, email: string, username: string, displayName: string}>} the user data
 */
export async function getCurrentUser(userId: string): Promise<{
  id: string;
  email: string;
  username: string;
  displayName: string;
}> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) throw new NotFoundError('User not found');

  return user;
}
