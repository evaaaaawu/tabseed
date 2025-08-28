import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetDb } from './db';
import { bulkUpsertTabs, listAllTabs } from './tabs-repo';

describe('tabs-repo bulk upsert', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('inserts and updates records', async () => {
    const inserted = await bulkUpsertTabs([
      { id: 't1', url: 'https://a.com', etag: 'e1', title: 'A' },
      { id: 't2', url: 'https://b.com', etag: 'e2' },
    ]);
    expect(inserted).toBe(2);

    let all = await listAllTabs();
    expect(all.length).toBe(2);

    const updated = await bulkUpsertTabs([
      { id: 't2', url: 'https://b.com', etag: 'e3', title: 'B updated' },
    ]);
    expect(updated).toBe(1);

    all = await listAllTabs();
    const t2 = all.find((t) => t.id === 't2');
    expect(t2?.etag).toBe('e3');
    expect(t2?.title).toBe('B updated');
  });
});
