import type { ReportCallback, Metric } from 'web-vitals';

export const reportWebVitals: ReportCallback = async (metric: Metric) => {
  try {
    await fetch('/api/telemetry/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        id: metric.id,
        value: metric.value,
        delta: (metric as any).delta ?? undefined,
        label: (metric as any).label ?? undefined,
      }),
      keepalive: true,
    });
  } catch (_) {
    // swallow
  }
};


