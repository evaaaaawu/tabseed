import { describe, expect, it, beforeEach } from 'vitest';
import { handleImportsTabs, ImportsTabsBodySchema } from './handle-imports-tabs';
import { store } from '@/lib/data/store';

describe('handleImportsTabs', () => {
  beforeEach(() => {
    // @ts-expect-error access private for resetting in tests via any
    (store as any).tabs?.clear?.();
    // @ts-expect-error
    (store as any).byOwnerAndUrl?.clear?.();
    // @ts-expect-error
    (store as any).idempotency?.clear?.();
  });

  it('validates body schema', () => {
    const parsed = ImportsTabsBodySchema.safeParse({ tabs: [{ url: 'https://example.com' }] });
    expect(parsed.success).toBe(true);
  });

  it('creates new tabs and reuses duplicates by default (auto)', () => {
    const ownerId = 'u1';
    const body = { tabs: [{ url: 'https://example.com?utm_source=x' }, { url: 'https://example.com/' }] };
    const res1 = handleImportsTabs({ ownerId, body });
    expect(res1.created.length).toBe(1);
    expect(res1.reused.length).toBe(0);

    const res2 = handleImportsTabs({ ownerId, body });
    expect(res2.created.length).toBe(0);
    expect(res2.reused.length).toBe(1);
  });

  it('forces new when dedupeMode=forceNew', () => {
    const ownerId = 'u2';
    const body = { tabs: [{ url: 'https://example.com' }], dedupeMode: 'forceNew' as const };
    const r1 = handleImportsTabs({ ownerId, body });
    const r2 = handleImportsTabs({ ownerId, body });
    expect(r1.created.length).toBe(1);
    expect(r2.created.length).toBe(1);
  });

  it('idempotency returns same result for same key', () => {
    const ownerId = 'u3';
    const key = 'idem-1';
    const body = { tabs: [{ url: 'https://example.com' }] };
    const a = handleImportsTabs({ ownerId, idempotencyKey: key, body });
    const b = handleImportsTabs({ ownerId, idempotencyKey: key, body });
    expect(b).toEqual(a);
  });
});


