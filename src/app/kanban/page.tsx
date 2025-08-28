"use client";

import { useState } from 'react';

import { Fab } from '@/components/fab/fab';
import { ImportTargetDialog, type ImportTarget } from '@/components/fab/import-target-dialog';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { importTabsAndSyncLocal } from '@/lib/data/import-tabs';
import { captureOpenTabs, type CapturedTab } from '@/lib/extension/bridge';

export default function KanbanIndexPage() {
  const [open, setOpen] = useState(false);
  const [openManual, setOpenManual] = useState(false);
  const [lastResult, setLastResult] = useState<{
    created: number;
    reused: number;
    ignored: number;
  } | null>(null);
  const extStatus = useExtensionStatus();

  const handleConfirm = async (target: ImportTarget, options: { closeImported: boolean }) => {
    try {
      const tabs = await captureOpenTabs({ closeImported: options.closeImported });

      // If no tabs captured (extension unavailable), open manual import dialog
      if (tabs.length === 0) {
        setOpen(false);
        setOpenManual(true);
        return;
      }

      await submitTabs(tabs, target, options.closeImported);
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        window.location.href = '/login';
        return;
      }
      throw err as Error;
    }
  };

  const handleManualSubmit = async (tabs: CapturedTab[]) => {
    // Default to inbox for manual import on kanban page
    await submitTabs(tabs, { type: 'inbox' }, false);
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
  };

  return (
    <div className="min-h-[60svh] p-6">
      <h1 className="mb-4 text-2xl font-bold">Kanban</h1>
      <p className="text-muted-foreground">This is the Kanban entry point.</p>
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

      <Fab label="Import Tabs" onClick={() => (extStatus === 'available' ? setOpen(true) : setOpenManual(true))} />
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
