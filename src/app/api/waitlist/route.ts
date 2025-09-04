import { NextRequest } from 'next/server';
import { z } from 'zod';

import { db, schema } from '@/lib/db/client';

const Body = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'validation_failed', message: 'invalid JSON' } }),
      { status: 400 },
    );
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: { code: 'validation_failed', message: 'invalid body' } }),
      { status: 400 },
    );
  }
  const { email, name } = parsed.data;
  const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await db.insert(schema.waitlistEntries).values({ id, email, name, status: 'pending' });
  } catch (err) {
    // Unique key or others
    return new Response(
      JSON.stringify({ error: { code: 'conflict', message: 'already submitted' } }),
      { status: 409 },
    );
  }
  return new Response(JSON.stringify({ ok: true }));
}


