import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';

declare global {
  // eslint-disable-next-line no-var
  var __tabseedMetrics:
    | {
        register: Registry;
        httpRequestCounter: Counter<string>;
        httpRequestDurationMs: Histogram<string>;
      }
    | undefined;
}

export interface MetricsBundle {
  readonly register: Registry;
  readonly httpRequestCounter: Counter<string>;
  readonly httpRequestDurationMs: Histogram<string>;
}

/**
 * Initialize and return a singleton metrics registry and common metrics.
 * Safe under Next.js HMR by caching on globalThis.
 */
export const getMetrics = (): MetricsBundle => {
  if (globalThis.__tabseedMetrics) {
    return globalThis.__tabseedMetrics;
  }

  const register = new Registry();
  register.setDefaultLabels({
    app: 'tabseed',
    env: process.env.NODE_ENV ?? 'development',
  });

  collectDefaultMetrics({ register });

  const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
  });

  const httpRequestDurationMs = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status'],
    buckets: [10, 25, 50, 100, 200, 400, 800, 1600, 5000, 10000],
    registers: [register],
  });

  const bundle: MetricsBundle = {
    register,
    httpRequestCounter,
    httpRequestDurationMs,
  };

  globalThis.__tabseedMetrics = bundle;
  return bundle;
};

/**
 * Measure a route handler execution and record http metrics.
 * You can use this wrapper to instrument API routes.
 */
export const measureApiHandler = async <T extends Response | Promise<Response>>(
  params: {
    method: string;
    route: string;
  },
  handler: () => T,
): Promise<Response> => {
  const { httpRequestCounter, httpRequestDurationMs } = getMetrics();
  const start = Date.now();
  try {
    const res = await handler();
    const status = res.status.toString();
    httpRequestCounter.labels(params.method, params.route, status).inc(1);
    httpRequestDurationMs
      .labels(params.method, params.route, status)
      .observe(Date.now() - start);
    return res;
  } catch (error) {
    httpRequestCounter.labels(params.method, params.route, '500').inc(1);
    httpRequestDurationMs
      .labels(params.method, params.route, '500')
      .observe(Date.now() - start);
    throw error;
  }
};

// Generic helpers to avoid "metric already registered" under HMR
export const getOrCreateHistogram = (
  name: string,
  help: string,
  options?: { labelNames?: string[]; buckets?: number[] },
): Histogram<string> => {
  const { register } = getMetrics();
  const existing = register.getSingleMetric(name) as Histogram<string> | undefined;
  if (existing) return existing;
  return new Histogram({
    name,
    help,
    labelNames: options?.labelNames ?? [],
    buckets: options?.buckets,
    registers: [register],
  });
};

export const getOrCreateCounter = (
  name: string,
  help: string,
  options?: { labelNames?: string[] },
): Counter<string> => {
  const { register } = getMetrics();
  const existing = register.getSingleMetric(name) as Counter<string> | undefined;
  if (existing) return existing;
  return new Counter({
    name,
    help,
    labelNames: options?.labelNames ?? [],
    registers: [register],
  });
};

export const getOrCreateGauge = (
  name: string,
  help: string,
  options?: { labelNames?: string[] },
): Gauge<string> => {
  const { register } = getMetrics();
  const existing = register.getSingleMetric(name) as Gauge<string> | undefined;
  if (existing) return existing;
  return new Gauge({
    name,
    help,
    labelNames: options?.labelNames ?? [],
    registers: [register],
  });
};
