import { getDb } from './db';
import type { InboxEntryRecord, TabRecord } from './types';

const ORDER_SPAN = 1_000;

export async function ensureInboxAtEnd(tabIds: readonly string[]): Promise<number> {
  if (tabIds.length === 0) return 0;
  const db = getDb();
  const now = new Date().toISOString();
  let created = 0;
  await db.transaction('rw', db.inbox, async () => {
    // Determine current last orderIndex
    const rows = await db.inbox.orderBy('orderIndex').reverse().toArray();
    let lastOrder = rows.length > 0 ? rows[0]!.orderIndex : 0;
    for (const tabId of tabIds) {
      const exists = await db.inbox.get(tabId);
      if (exists) continue;
      lastOrder += ORDER_SPAN;
      const rec: InboxEntryRecord = {
        tabId,
        orderIndex: lastOrder,
        createdAt: now,
        updatedAt: now,
      };
      await db.inbox.put(rec);
      created += 1;
    }
  });
  return created;
}

export async function listInboxNewest(): Promise<readonly TabRecord[]> {
  const db = getDb();
  const entries = await db.inbox.orderBy('orderIndex').reverse().toArray();
  if (entries.length === 0) return [];
  const ids = entries.map((e) => e.tabId);
  const rows = await db.tabs.bulkGet(ids);
  const byId = new Map(rows.filter(Boolean).map((t) => [t!.id, t!] as const));
  // Keep the inbox order
  return ids.map((id) => byId.get(id)).filter(Boolean) as TabRecord[];
}

export async function removeFromInbox(tabId: string): Promise<void> {
  const db = getDb();
  await db.inbox.delete(tabId);
}
