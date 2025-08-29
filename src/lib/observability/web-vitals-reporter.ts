import type { Metric, ReportCallback } from 'web-vitals';

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
        // web-vitals Metric has optional delta/label on specific metric subtypes
        delta: (metric as Partial<Metric> & { delta?: number }).delta,
        label: (metric as Partial<Metric> & { label?: string }).label,
      }),
      keepalive: true,
    });
  } catch {
    // swallow
  }
};
