import { NextRequest, NextResponse } from 'next/server';
import auth from './lib/auth';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // get session
  const res = await auth.api.getSession({
    headers: request.headers,
  });

  // check if null
  const hasSession = res.session !== null && res.user !== null;

  const session = hasSession ? res.session : null;

  // routes
  const isAuthRoute =
    pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  const isProtectedRoute = pathname.startsWith('/dashboard');

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!session && isProtectedRoute) {
    // Store the original URL as a query parameter and redirect to sign-in
    // eg: /sign-in?redirect=/dashboard/settings
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
