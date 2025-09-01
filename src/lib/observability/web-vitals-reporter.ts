export const reportWebVitals = async (metric: unknown): Promise<void> => {
  try {
    const m = metric as {
      name?: string;
      id?: string;
      value?: number;
      delta?: number;
      label?: string;
    };
    await fetch('/api/telemetry/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: m.name,
        id: m.id,
        value: m.value,
        delta: m.delta,
        label: m.label,
      }),
      keepalive: true,
    });
  } catch {
    // swallow
  }
};
