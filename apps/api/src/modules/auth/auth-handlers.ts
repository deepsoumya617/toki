// handles auth related logic like signup, signin...

import {
  type SignInInput,
  type SessionPayload,
  type SignUpInput,
} from '@xd/shared';
import {
  createSession,
  deleteSession,
  getSession,
} from '../../lib/session-store';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import { users, type PublicUser } from '@xd/db/schema/users';
import { eq, or } from 'drizzle-orm';
import { db } from '@xd/db';

// handle sign up logic
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

// sign in
export async function signInHandler(input: SignInInput): Promise<string> {
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

// logout>
export async function logoutHandler(token: string): Promise<void> {
  await deleteSession(token);
}

// get current user data
export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      status: users.status,
      lastSeen: users.lastSeen,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) throw new NotFoundError('User not found');

  return user;
}

// get session data based on token
export async function sessionHandler(
  token: string
): Promise<{ session: SessionPayload; user: PublicUser } | null> {
  try {
    const session = await getSession(token);
    if (!session) return null;

    const user = await getCurrentUser(session.userId);

    return { session, user };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}
