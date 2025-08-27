import { bindRequestId } from '@/lib/observability/logger';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const requestId = bindRequestId(req.headers);
  const res = NextResponse.next();
  res.headers.set('TS-Request-Id', requestId);
  return res;
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
