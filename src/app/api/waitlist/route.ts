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
  const id = `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await db.insert(schema.waitlistEntries).values({ id, email, name, reason, status: 'pending' });
  } catch (err) {
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
  return jsonResponse({ ok: true });
}
