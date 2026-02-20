import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  signUpSchema,
} from '@xd/shared';
import { setCookie, getCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { signUpHandler } from './auth-handlers';
import { httpEnv } from '@xd/env/http';
import { Hono } from 'hono';

const auth = new Hono();

/**
 * @route POST /api/auth/signup
 * @desc signup route
 */
auth.post('/signup', zValidator('json', signUpSchema), async c => {
  const input = c.req.valid('json');

  const token = await signUpHandler(input);

  // set the cooke with the token
  setCookie(
    c,
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(httpEnv.NODE_ENV === 'production')
  );

  return c.json({
    success: true,
    message: 'Signup successful',
  });
});

export default auth;
