import {
  getSessionCookieOptions,
  logInSchema,
  SESSION_COOKIE_NAME,
  signUpSchema,
} from '@xd/shared';
import {
  getCurrentUser,
  logInHandler,
  logoutHandler,
  signUpHandler,
} from './auth-handlers';
import { sessionMiddleware } from '../../middleware/session-middleware';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { HonoVariables } from '../../types/hono';
import { zValidator } from '@hono/zod-validator';
import { httpEnv } from '@xd/env/http';
import { Hono } from 'hono';

// we've to bind the session to the context of the auth routes,
// so that we can access it in the handlers
const auth = new Hono<{ Variables: HonoVariables }>()

  /**
   * @route POST /api/auth/signup
   * @desc signup route
   */
  .post('/signup', zValidator('json', signUpSchema), async c => {
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
  })

  /**
   * @route POST /api/auth/login
   * @desc login route
   */
  .post('/login', zValidator('json', logInSchema), async c => {
    const input = c.req.valid('json');

    const token = await logInHandler(input);

    // set the cookie with the token
    setCookie(
      c,
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions(httpEnv.NODE_ENV === 'production')
    );

    return c.json({
      success: true,
      message: 'Login successful',
    });
  })

  /**
   * @route POST /api/auth/logout
   * @desc logout route
   */
  .post('/logout', sessionMiddleware, async c => {
    const token = getCookie(c, SESSION_COOKIE_NAME) as string;

    await logoutHandler(token);

    // clear the cookie
    deleteCookie(c, SESSION_COOKIE_NAME);

    return c.json(
      {
        success: true,
        message: 'Logout successful',
      },
      200
    );
  })

  /**
   * @route GET /api/auth/me
   * @desc get current user route
   */
  .get('/me', sessionMiddleware, async c => {
    const session = c.get('session');
    const user = await getCurrentUser(session.userId);

    return c.json({
      success: true,
      user,
    });
  });

export default auth;
