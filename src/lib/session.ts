import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export interface Session {
  readonly userId: string;
  readonly email?: string;
  readonly name?: string;
}

const SESSION_COOKIE = 'ts_session';

export async function getSessionOrNull(_req?: NextRequest): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
