import { bindRequestId } from '@/lib/observability/logger';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/login/test',
  '/waitlist',
  '/pending',
  '/admin/waitlist',
  '/api/auth/test-login',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/session',
  '/api/waitlist',
  '/api/admin/waitlist',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const requestId = bindRequestId(req.headers);
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    res.headers.set('TS-Request-Id', requestId);
    return res;
  }

  // Auth guard for private paths
  const cookie = req.cookies.get('ts_session')?.value;
  if (!cookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.headers.set('TS-Request-Id', requestId);
    return res;
  }

  const res = NextResponse.next();
  res.headers.set('TS-Request-Id', requestId);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|public|favicon.ico).*)'],
};
