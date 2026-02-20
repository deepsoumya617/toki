// handles auth related logic like signup, login...

import { createSession } from '../../lib/session-store';
import { ConflictError } from '../../lib/errors';
import { type SignUpInput } from '@xd/shared';
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
