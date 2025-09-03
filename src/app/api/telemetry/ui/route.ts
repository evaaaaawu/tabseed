import { NextRequest } from 'next/server';

import { getLogger } from '@/lib/observability/logger';
import { getOrCreateCounter, measureApiHandler } from '@/lib/observability/metrics';

export const runtime = 'nodejs';

type UiEventBody = {
  readonly name: string;
  readonly data?: Record<string, unknown>;
};

export async function POST(req: NextRequest): Promise<Response> {
  return measureApiHandler({ method: 'POST', route: '/api/telemetry/ui' }, async () => {
    const logger = getLogger();
    const counter = getOrCreateCounter('ui_events_total', 'Total UI events', { labelNames: ['name'] });

    let body: UiEventBody | undefined;
    try {
      body = (await req.json()) as UiEventBody;
    } catch {}

    const name = body?.name ?? 'unknown';
    const data = body?.data ?? {};

    counter.labels(name).inc(1);
    logger.info({ type: 'ui_event', name, data }, 'UI event');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}


