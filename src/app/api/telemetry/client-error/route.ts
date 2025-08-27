import { NextRequest } from 'next/server';
import { getLogger } from '@/lib/observability/logger';

export const runtime = 'nodejs';

type ClientErrorPayload = {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
};

export async function POST(req: NextRequest): Promise<Response> {
  const logger = getLogger();
  try {
    const payload = (await req.json()) as ClientErrorPayload;
    logger.error({ type: 'client-error', payload }, 'client error');
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error({ err: error }, 'failed to record client-error');
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


