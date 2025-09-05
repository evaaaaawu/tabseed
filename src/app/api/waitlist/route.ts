import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { ulid } from 'ulid';
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
  const requestId = `req_${ulid()}`;
  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'TS-Request-Id': requestId,
      },
    });

  // Naive in-memory rate limit per IP (window 60s, 100 req)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const WINDOW_MS = 60_000;
  const LIMIT = 100;
  const rate = (global as unknown as { __ts_waitlist_rate__?: Map<string, { c: number; t: number }> }).__ts_waitlist_rate__ ||
    new Map<string, { c: number; t: number }>();
  (global as unknown as { __ts_waitlist_rate__?: Map<string, { c: number; t: number }> }).__ts_waitlist_rate__ = rate;
  const rec = rate.get(ip);
  if (!rec || now - rec.t > WINDOW_MS) {
    rate.set(ip, { c: 1, t: now });
  } else {
    if (rec.c >= LIMIT) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'rate_limited',
            message: 'Too many requests. Please try again later.',
            requestId,
            retryable: true,
          },
        }),
        { status: 429, headers: { 'Retry-After': '60', 'TS-Request-Id': requestId, 'Content-Type': 'application/json' } },
      );
    }
    rec.c += 1;
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonResponse(
      { error: { code: 'validation_failed', message: 'invalid JSON', requestId, retryable: false } },
      400,
    );
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: {
          code: 'validation_failed',
          message: 'invalid body',
          details: parsed.error.flatten(),
          requestId,
          retryable: false,
        },
      },
      400,
    );
  }

  const { email, name, reason } = parsed.data;
  // Check existing entry to split responses
  const existed = await db
    .select({ id: schema.waitlistEntries.id, status: schema.waitlistEntries.status })
    .from(schema.waitlistEntries)
    .where(eq(schema.waitlistEntries.email, email))
    .limit(1);
  if (existed.length > 0) {
    const st = existed[0].status;
    if (st === 'approved') {
      return jsonResponse(
        {
          error: {
            code: 'already_approved',
            message: 'This email has been approved. You can sign in with Google now.',
            details: { field: 'email' },
            requestId,
            retryable: false,
          },
        },
        409,
      );
    }
    return jsonResponse(
      {
        error: {
          code: 'conflict',
          message: 'Email already on the waitlist',
          details: { field: 'email' },
          requestId,
          retryable: false,
        },
      },
      409,
    );
  }

  try {
    const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(schema.waitlistEntries).values({ id, email, name, reason, status: 'pending' });
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse(
      {
        error: {
          code: 'internal_error',
          message: 'Server error while saving. Please try again later.',
          requestId,
          retryable: true,
        },
      },
      500,
    );
  }
}
