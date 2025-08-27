import { describe, expect, it } from 'vitest';

describe('GET /api/metrics', () => {
  it('should export text/plain content type', async () => {
    // Dynamic import to avoid Next runtime coupling
    const mod = await import('./route');
    const res = await mod.GET(new Request('http://localhost/api/metrics') as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')?.includes('text/plain')).toBe(true);
  });
});


