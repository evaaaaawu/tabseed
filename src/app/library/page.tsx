'use client';

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { TabCard } from '@/components/tabs/tab-card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { importTabsAndSyncLocalWithRaw } from '@/lib/data/import-tabs';
import type { CapturedTab } from '@/lib/extension/bridge';
import { useAllTabsNewest } from '@/lib/idb/hooks';

export default function LibraryPage() {
  const { tabs, loading } = useAllTabsNewest();
  const [openManual, setOpenManual] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-[60svh] p-6">
      <Heading as="h1" className="mb-4">
        Library
      </Heading>
      <Text muted size="sm">
        All saved tabs in a grid view. Newest first.
      </Text>

      <div className="mt-4">
        {loading ? (
          <Text size="sm" muted>
            Loading...
          </Text>
        ) : tabs.length === 0 ? (
          <EmptyState
            title="No tabs yet"
            description="Import your open tabs or paste URLs to get started."
            action={
              <button
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                onClick={() => setOpenManual(true)}
              >
                Import Tabs
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tabs.map((t) => (
              <TabCard
                key={t.id}
                id={t.id}
                url={t.url}
                title={t.title}
                color={t.color}
                selected={selected.has(t.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      <Fab label="Import Tabs" onClick={() => setOpenManual(true)} />
      <ManualImportDialog
        open={openManual}
        onOpenChange={setOpenManual}
        onSubmit={async (tabsInput: CapturedTab[]) => {
          const res = await importTabsAndSyncLocalWithRaw(
            tabsInput.map((t) => ({ url: t.url, title: t.title })),
            { idempotencyKey: crypto.randomUUID(), target: { inbox: true } },
          );
          if (res.counts.created > 0) {
            addToast({
              variant: 'success',
              title: 'Imported',
              description: `${res.counts.created} new added`,
            });
          } else if (res.counts.reused > 0) {
            addToast({
              variant: 'warning',
              title: 'All duplicates',
              description: `${res.counts.reused} already exist`,
            });
          } else {
            addToast({ variant: 'default', title: 'Nothing imported' });
          }
        }}
      />
    </div>
  );
}
