import { getMetrics } from '@/lib/observability/metrics';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest): Promise<Response> {
  const { register } = getMetrics();
  const body = await register.metrics();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': register.contentType,
      'Cache-Control': 'no-store',
    },
  });
}
