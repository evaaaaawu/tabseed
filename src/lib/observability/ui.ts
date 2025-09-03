export async function postUiEvent(name: string, data?: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/telemetry/ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data }),
      keepalive: true,
    });
  } catch {
    // Best-effort only
  }
}


