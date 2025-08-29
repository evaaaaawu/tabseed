"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { ImportTargetDialog, type ImportTarget } from '@/components/fab/import-target-dialog';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { useToast } from '@/components/ui/toast';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { importTabsAndSyncLocal } from '@/lib/data/import-tabs';
import { captureOpenTabs, type CapturedTab } from '@/lib/extension/bridge';
import { useAllTabs } from '@/lib/idb/hooks';

export default function InboxPage() {
  const [open, setOpen] = useState(false);
  const [openManual, setOpenManual] = useState(false);
  const [lastResult, setLastResult] = useState<{
    created: number;
    reused: number;
    ignored: number;
  } | null>(null);
  const extStatus = useExtensionStatus();
  const { addToast } = useToast();
  const { tabs: localTabs, loading } = useAllTabs();

  const handleConfirm = async (target: ImportTarget, options: { closeImported: boolean }) => {
    try {
      const tabs = await captureOpenTabs({ closeImported: options.closeImported });

      // If no tabs captured (extension unavailable), open manual import dialog
      if (tabs.length === 0) {
        setOpen(false);
        setOpenManual(true);
        return;
      }

      const r = await submitTabs(tabs, target, options.closeImported);
      if (r.created > 0 && r.reused === 0) {
        addToast({
          variant: 'success',
          title: 'Imported',
          description: `${r.created} new ${r.created === 1 ? 'tab' : 'tabs'} added`,
        });
      } else if (r.created > 0 && r.reused > 0) {
        addToast({
          variant: 'warning',
          title: 'Partially imported',
          description: `${r.created} new, ${r.reused} already exist`,
        });
      } else if (r.created === 0 && r.reused > 0) {
        addToast({
          variant: 'warning',
          title: 'All duplicates',
          description: `${r.reused} link${r.reused === 1 ? '' : 's'} already in your library`,
        });
      } else {
        addToast({ variant: 'default', title: 'Nothing imported' });
      }
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        window.location.href = '/login';
        return;
      }
      addToast({ variant: 'error', title: 'Import failed', description: (err as Error).message });
      throw err as Error;
    }
  };

  const handleManualSubmit = async (tabs: CapturedTab[]) => {
    const r = await submitTabs(tabs, { type: 'inbox' }, false);
    if (r.created > 0 && r.reused === 0) {
      addToast({ variant: 'success', title: 'Imported', description: `${r.created} new added` });
    } else if (r.created > 0 && r.reused > 0) {
      addToast({ variant: 'warning', title: 'Partially imported', description: `${r.created} new, ${r.reused} exist` });
    } else if (r.created === 0 && r.reused > 0) {
      addToast({ variant: 'warning', title: 'All duplicates', description: `${r.reused} already exist` });
    } else {
      addToast({ variant: 'default', title: 'Nothing imported' });
    }
  };

  const submitTabs = async (tabs: CapturedTab[], target: ImportTarget, closeImported: boolean) => {
    const result = await importTabsAndSyncLocal(
      tabs.map((t) => ({ url: t.url, title: t.title })),
      {
        idempotencyKey: crypto.randomUUID(),
        target: target.type === 'inbox' ? { inbox: true } : { boardId: target.boardId },
        closeImported,
      },
    );
    setLastResult(result);
    return result;
  };

  return (
    <div className="min-h-[60svh] p-6">
      <h1 className="mb-4 text-2xl font-bold">Inbox</h1>
      <p className="text-muted-foreground">This is the Inbox page.</p>
      <div className="mt-2 text-xs text-muted-foreground">
        Extension status:{' '}
        {extStatus === 'unknown'
          ? 'Detecting...'
          : extStatus === 'available'
            ? 'Available'
            : 'Not detected (manual import will be available)'}
      </div>
      {lastResult ? (
        <div className="mt-3 rounded-md border p-3 text-sm">
          <div className="font-medium">Latest import result</div>
          <div className="mt-1 text-muted-foreground">
            created: {lastResult.created}, reused: {lastResult.reused}, ignored:{' '}
            {lastResult.ignored}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-2 text-sm font-medium">Local tabs (IndexedDB)</div>
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading...</div>
        ) : localTabs.length === 0 ? (
          <div className="text-xs text-muted-foreground">No tabs imported yet.</div>
        ) : (
          <ul className="space-y-2">
            {localTabs.map((t) => (
              <li key={t.id} className="truncate rounded-md border p-2 text-sm">
                <a href={t.url} target="_blank" rel="noreferrer" className="underline">
                  {t.title ?? t.url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Fab
        label="Import Tabs"
        onClick={() => (extStatus === 'available' ? setOpen(true) : setOpenManual(true))}
      />
      <ImportTargetDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        onSwitchToManual={() => setOpenManual(true)}
      />
      <ManualImportDialog
        open={openManual}
        onOpenChange={setOpenManual}
        onSubmit={handleManualSubmit}
      />
    </div>
  );
}
