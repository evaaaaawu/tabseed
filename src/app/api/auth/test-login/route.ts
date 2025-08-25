import { NextRequest } from 'next/server';
import { z } from 'zod';
import { setSession, clearSession, getSessionOrNull } from '@/lib/session';

const Body = z.object({ code: z.string().min(1) });

const TEST_LOGIN_CODES = (process.env.TEST_LOGIN_CODES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: { code: 'validation_failed', message: 'invalid JSON' } }), {
      status: 400,
    });
  }
  const parse = Body.safeParse(json);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: { code: 'validation_failed', message: 'invalid body' } }), {
      status: 400,
    });
  }
  const { code } = parse.data;
  if (!TEST_LOGIN_CODES.includes(code)) {
    return new Response(JSON.stringify({ error: { code: 'unauthorized', message: 'invalid code' } }), {
      status: 401,
    });
  }
  await setSession({ userId: `test_${code}` });
  return new Response(JSON.stringify({ ok: true }));
}

export async function GET() {
  const session = await getSessionOrNull();
  return new Response(JSON.stringify({ session }), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE() {
  await clearSession();
  return new Response(null, { status: 204 });
}


