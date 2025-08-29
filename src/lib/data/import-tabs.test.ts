import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/lib/api/imports-client';
import { resetDb } from '@/lib/idb/db';
import { listAllTabs } from '@/lib/idb/tabs-repo';

import { importTabsAndSyncLocal } from './import-tabs';

describe('importTabsAndSyncLocal', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('calls Import API then writes to IDB', async () => {
    const spy = vi.spyOn(api, 'postImportsTabs').mockResolvedValue({
      created: [
        { id: 't1', url: 'https://a.com', title: 'A', etag: 'e1' },
        { id: 't2', url: 'https://b.com', etag: 'e2' },
      ],
      reused: [{ id: 't3', url: 'https://c.com', etag: 'e3' }],
      ignored: [],
    });

    const result = await importTabsAndSyncLocal([
      { url: 'https://a.com', title: 'A' },
      { url: 'https://b.com' },
    ]);

    expect(result).toEqual({ created: 2, reused: 1, ignored: 0 });
    expect(spy).toHaveBeenCalledTimes(1);

    const all = await listAllTabs();
    expect(all.map((t) => t.id).sort()).toEqual(['t1', 't2', 't3']);
  });
});
