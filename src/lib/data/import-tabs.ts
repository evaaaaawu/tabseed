"use client";

import { postImportsTabs } from '@/lib/api/imports-client';
import { bulkUpsertTabs } from '@/lib/idb/tabs-repo';
import type { TabUpsertInput } from '@/lib/idb/types';
import type { ImportsTabsBody } from '@/lib/imports/handle-imports-tabs';

type OpenTab = { url: string; title?: string };

/**
 * Call Import API then sync result to IndexedDB in bulk.
 */
export async function importTabsAndSyncLocalWithRaw(
  openTabs: ReadonlyArray<OpenTab>,
  input?: {
    idempotencyKey?: string;
    target?: ImportsTabsBody['target'];
    closeImported?: boolean;
  },
): Promise<{ counts: { created: number; reused: number; ignored: number }; raw: Awaited<ReturnType<typeof postImportsTabs>> }> {
  if (openTabs.length === 0)
    return {
      counts: { created: 0, reused: 0, ignored: 0 },
      raw: { created: [], reused: [], ignored: [] } as unknown as Awaited<ReturnType<typeof postImportsTabs>>,
    };

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
  return { counts: { created: res.created.length, reused: res.reused.length, ignored: res.ignored.length }, raw: res };
}

export async function importTabsAndSyncLocal(
  openTabs: ReadonlyArray<OpenTab>,
  input?: {
    idempotencyKey?: string;
    target?: ImportsTabsBody['target'];
    closeImported?: boolean;
  },
): Promise<{ created: number; reused: number; ignored: number }> {
  const r = await importTabsAndSyncLocalWithRaw(openTabs, input);
  return r.counts;
}
