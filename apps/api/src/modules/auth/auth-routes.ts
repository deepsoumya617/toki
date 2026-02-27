import {
  getSessionCookieOptions,
  signInSchema,
  SESSION_COOKIE_NAME,
  signUpSchema,
  type SessionPayload,
} from '@xd/shared';
import {
  getCurrentUser,
  signInHandler,
  logoutHandler,
  sessionHandler,
  signUpHandler,
} from './auth-handlers';
import { sessionMiddleware } from '../../middleware/session-middleware';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { httpEnv } from '@xd/env/http';
import { Hono } from 'hono';

// define conext vars
export interface HonoVariables {
  session: SessionPayload;
}

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
   * @route POST /api/auth/signin
   * @desc sign in route
   */
  .post('/signin', zValidator('json', signInSchema), async c => {
    const input = c.req.valid('json');

    const token = await signInHandler(input);

    // set the cookie with the token
    setCookie(
      c,
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions(httpEnv.NODE_ENV === 'production')
    );

    return c.json({
      success: true,
      message: 'Sign in successful',
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
   * @route GET /api/auth/get-session
   * @desc get session route
   */
  .get('/get-session', async c => {
    const token = getCookie(c, SESSION_COOKIE_NAME);
    if (!token) {
      return c.json({
        success: false,
        data: { session: null, user: null },
      });
    }

    const sessionData = await sessionHandler(token);

    if (!sessionData) {
      return c.json({
        success: false,
        data: { session: null, user: null },
      });
    }

    return c.json({
      success: true,
      data: sessionData,
    });
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
