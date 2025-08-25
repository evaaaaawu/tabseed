import { ImportsTabsBodySchema, handleImportsTabs } from '@/lib/imports/handle-imports-tabs';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const HeadersSchema = z.object({
  tsApiVersion: z.string().nonempty(),
  idempotencyKey: z.string().optional(),
});

function readHeader(req: NextRequest, name: string): string | undefined {
  const val = req.headers.get(name) ?? req.headers.get(name.toLowerCase());
  return val === null ? undefined : (val ?? undefined);
}

export async function POST(req: NextRequest) {
  const headers = HeadersSchema.safeParse({
    tsApiVersion: readHeader(req, 'TS-API-Version'),
    idempotencyKey: readHeader(req, 'Idempotency-Key'),
  });
  if (!headers.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'validation_failed',
          message: 'invalid headers',
          details: headers.error.flatten(),
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'validation_failed', message: 'invalid JSON body' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const bodyParse = ImportsTabsBodySchema.safeParse(json);
  if (!bodyParse.success) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'validation_failed',
          message: 'invalid body',
          details: bodyParse.error.flatten(),
        },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // TODO: replace with actual session user when auth is wired
  const ownerId = 'user_dev_placeholder';
  const result = handleImportsTabs({
    ownerId,
    idempotencyKey: headers.data.idempotencyKey,
    body: bodyParse.data,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'TS-Request-Id': crypto.randomUUID(),
    },
  });
}
