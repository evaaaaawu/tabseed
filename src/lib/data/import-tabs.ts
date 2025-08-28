"use client";

import { postImportsTabs } from '@/lib/api/imports-client';
import { bulkUpsertTabs } from '@/lib/idb/tabs-repo';
import type { TabUpsertInput } from '@/lib/idb/types';
import type { ImportsTabsBody } from '@/lib/imports/handle-imports-tabs';

type OpenTab = { url: string; title?: string };

/**
 * Call Import API then sync result to IndexedDB in bulk.
 */
export async function importTabsAndSyncLocal(
  openTabs: ReadonlyArray<OpenTab>,
  input?: {
    idempotencyKey?: string;
    target?: ImportsTabsBody['target'];
    closeImported?: boolean;
  },
): Promise<{ created: number; reused: number; ignored: number }> {
  if (openTabs.length === 0) return { created: 0, reused: 0, ignored: 0 };

  const res = await postImportsTabs(
    {
      tabs: openTabs.map((t) => ({ url: t.url, title: t.title })),
      target: input?.target,
      closeImported: input?.closeImported,
    },
    { idempotencyKey: input?.idempotencyKey },
  );

  const toUpsert: TabUpsertInput = [...res.created, ...res.reused].map((t) => ({
    id: t.id,
    url: t.url,
    title: t.title,
    etag: t.etag,
  }));

  await bulkUpsertTabs(toUpsert);
  return { created: res.created.length, reused: res.reused.length, ignored: res.ignored.length };
}
