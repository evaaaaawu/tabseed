import { NextRequest } from 'next/server';

import { getLogger } from '@/lib/observability/logger';
import { getMetrics, getOrCreateHistogram } from '@/lib/observability/metrics';

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
    // Aggregate into histograms by metric name
    switch (payload.name) {
      case 'LCP':
        getOrCreateHistogram('ts_web_vitals_lcp_ms', 'Largest Contentful Paint in ms', {
          buckets: [800, 1200, 1600, 2500, 4000, 6000, 10000],
        }).observe(payload.value);
        break;
      case 'INP':
        getOrCreateHistogram('ts_web_vitals_inp_ms', 'Interaction to Next Paint in ms', {
          buckets: [50, 100, 200, 300, 500, 800, 1200, 2000],
        }).observe(payload.value);
        break;
      case 'CLS':
        getOrCreateHistogram('ts_web_vitals_cls', 'Cumulative Layout Shift', {
          buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1],
        }).observe(payload.value);
        break;
      default:
        // ignore others for now (FID, TTFB if reported)
        break;
    }

    httpRequestCounter.labels('POST', '/api/telemetry/web-vitals', '200').inc(1);
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
