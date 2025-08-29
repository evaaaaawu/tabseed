import { NextRequest } from 'next/server';

import { getLogger } from '@/lib/observability/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<Response> {
  const logger = getLogger();
  const requestId = req.headers.get('ts-request-id') ?? 'unknown';
  logger.info({ requestId }, 'telemetry log example');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
