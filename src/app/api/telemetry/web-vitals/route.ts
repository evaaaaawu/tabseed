import { NextRequest } from 'next/server';
import { getLogger } from '@/lib/observability/logger';
import { getMetrics } from '@/lib/observability/metrics';

export const runtime = 'nodejs';

type WebVitalsPayload = {
  name: string;
  id: string;
  value: number;
  delta?: number;
  label?: string;
};

export async function POST(req: NextRequest): Promise<Response> {
  const logger = getLogger();
  const { httpRequestCounter } = getMetrics();
  try {
    const payload = (await req.json()) as WebVitalsPayload;
    logger.info({ type: 'web-vitals', payload });
    // Simple count per metric name
    httpRequestCounter
      .labels('POST', '/api/telemetry/web-vitals', '200')
      .inc(1);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error({ err: error }, 'failed to record web-vitals');
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


