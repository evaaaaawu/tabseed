import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/login/test',
  '/waitlist',
  '/api/auth/test-login',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/waitlist',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get('ts_session')?.value;
  if (!cookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|public).*)'],
};

import { NextRequest, NextResponse } from 'next/server';

import { bindRequestId } from '@/lib/observability/logger';

export function middleware(req: NextRequest) {
  const requestId = bindRequestId(req.headers);
  const res = NextResponse.next();
  res.headers.set('TS-Request-Id', requestId);
  return res;
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
