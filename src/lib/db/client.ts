import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getOrCreateGauge, getOrCreateHistogram } from '@/lib/observability/metrics';

import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Observe pool stats periodically (no-op in test env if timers faked)
try {
  const poolTotal = getOrCreateGauge('ts_db_pool_total_connections', 'pg pool total connections');
  const poolIdle = getOrCreateGauge('ts_db_pool_idle', 'pg pool idle');
  const poolWaiting = getOrCreateGauge('ts_db_pool_waiting', 'pg pool waiting');
  const poolWait = getOrCreateHistogram('ts_db_pool_wait_time_ms', 'pg pool wait time in ms', {
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000],
  });

  // monkey patch acquire to measure wait time
  const origConnect = (pool as any).acquire;
  if (typeof origConnect === 'function') {
    (pool as any).acquire = async function (...args: unknown[]) {
      const start = Date.now();
      try {
        return await origConnect.apply(this, args);
      } finally {
        poolWait.observe(Date.now() - start);
      }
    };
  }

  setInterval(() => {
    const anyPool = pool as any;
    poolTotal.set(anyPool.totalCount ?? 0);
    poolIdle.set(anyPool.idleCount ?? 0);
    poolWaiting.set(anyPool.waitingCount ?? 0);
  }, 5000).unref?.();
} catch {
  // metrics are best-effort; ignore if registry not ready in tests
}
export const db = drizzle(pool, { schema });

export type DbClient = typeof db;
export { schema };
