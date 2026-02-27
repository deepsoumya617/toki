export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_COOKIE_NAME = 'xd_session';
export const SESSION_TOKEN_BYTES = 32; // 256 bits

const SESSION_COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  maxAge: SESSION_EXPIRY_SECONDS,
  path: '/',
  sameSite: 'lax' as const,
};

export const getSessionCookieOptions = (isProduction: boolean) => ({
  ...SESSION_COOKIE_OPTIONS_BASE,
  secure: isProduction,
});

export const REDIS_SESSION_TTL_SECONDS = 60 * 60; // 1 hour
export const REDIS_SESSION_PREFIX = 'session:';

export const SESSION_QUERY_KEY = ['session'] as const;
