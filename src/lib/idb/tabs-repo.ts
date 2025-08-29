import { getDb } from './db';
import type { TabRecord, TabUpsertInput } from './types';

/**
 * Bulk upsert tabs into IndexedDB using Dexie.
 * - Inserts new records if not existing, updates existing by id.
 * - For dedupe by url, caller should pass normalized url from server.
 */
export async function bulkUpsertTabs(records: TabUpsertInput): Promise<number> {
  if (records.length === 0) return 0;
  const db = getDb();
  let affected = 0;
  await db.transaction('rw', db.tabs, async () => {
    // Map by id for put
    const toPut: TabRecord[] = records.map((r) => ({
      id: r.id,
      url: r.url,
      etag: r.etag,
      title: r.title,
      color: r.color,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isDeleted: r.isDeleted,
    }));

    await db.tabs.bulkPut(toPut);
    affected = toPut.length;
  });
  return affected;
}

export async function listAllTabs(): Promise<readonly TabRecord[]> {
  const db = getDb();
  return db.tabs.orderBy('id').toArray();
}
