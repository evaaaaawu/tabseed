import { NextRequest } from 'next/server';
import { z } from 'zod';

import { db, schema } from '@/lib/db/client';

const Query = z.object({ token: z.string().min(1) });
const Body = z.object({ email: z.string().email(), status: z.enum(['approved', 'rejected']) });

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = Query.safeParse({ token: url.searchParams.get('token') ?? '' });
  if (!parsed.success || parsed.data.token !== process.env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }
  const entries = await db.select().from(schema.waitlistEntries);
  return new Response(JSON.stringify({ items: entries }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = Query.safeParse({ token: url.searchParams.get('token') ?? '' });
  if (!parsed.success || parsed.data.token !== process.env.ADMIN_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response('invalid JSON', { status: 400 });
  }
  const body = Body.safeParse(json);
  if (!body.success) return new Response('invalid body', { status: 400 });
  const { email, status } = body.data;
  await db
    .update(schema.waitlistEntries)
    .set({ status })
    .where((t, { eq }) => eq(t.email, email));
  return new Response(JSON.stringify({ ok: true }));
}


