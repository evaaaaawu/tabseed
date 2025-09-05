import { NextRequest } from 'next/server';
import { z } from 'zod';

import { db, schema } from '@/lib/db/client';

const Body = z.object({
  email: z
    .string()
    .email()
    .refine((v) => /@gmail\.com$/i.test(v.trim()), { message: 'gmail only' }),
  // name is deprecated on client but still accepted if present (backward compatibility)
  name: z.string().min(1).max(120).optional(),
  reason: z.string().min(5).max(1000),
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
  const { email, name, reason } = parsed.data;
  const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await db.insert(schema.waitlistEntries).values({ id, email, name, reason, status: 'pending' });
  } catch (err) {
    // Unique key or others
    return new Response(
      JSON.stringify({ error: { code: 'conflict', message: 'already submitted' } }),
      { status: 409 },
    );
  }
  return new Response(JSON.stringify({ ok: true }));
}
