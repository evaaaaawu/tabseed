"use client";

import { useState } from 'react';

import { type ImportTarget, ImportTargetDialog } from '@/components/fab/import-target-dialog';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { TabCard } from '@/components/tabs/tab-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Surface } from '@/components/ui/surface';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { importTabsAndSyncLocalWithRaw } from '@/lib/data/import-tabs';
import { type CapturedTab, captureOpenTabs } from '@/lib/extension/bridge';
import { useAllTabsNewest } from '@/lib/idb/hooks';
import { Plus } from 'lucide-react';

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
  const { tabs, loading } = useAllTabsNewest();
  // store raw result to sessionStorage for details page

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
          linkHref: '/import/result',
          linkLabel: 'View details',
        });
      } else if (r.created > 0 && r.reused > 0) {
        addToast({
          variant: 'warning',
          title: 'Partially imported',
          description: `${r.created} new, ${r.reused} already exist`,
          linkHref: '/import/result',
          linkLabel: 'View details',
        });
      } else if (r.created === 0 && r.reused > 0) {
        addToast({
          variant: 'warning',
          title: 'All duplicates',
          description: `${r.reused} link${r.reused === 1 ? '' : 's'} already in your library`,
          linkHref: '/import/result',
          linkLabel: 'View details',
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
      addToast({
        variant: 'success',
        title: 'Imported',
        description: `${r.created} new added`,
        linkHref: '/import/result',
        linkLabel: 'View details',
      });
    } else if (r.created > 0 && r.reused > 0) {
      addToast({
        variant: 'warning',
        title: 'Partially imported',
        description: `${r.created} new, ${r.reused} exist`,
        linkHref: '/import/result',
        linkLabel: 'View details',
      });
    } else if (r.created === 0 && r.reused > 0) {
      addToast({
        variant: 'warning',
        title: 'All duplicates',
        description: `${r.reused} already exist`,
        linkHref: '/import/result',
        linkLabel: 'View details',
      });
    } else {
      addToast({ variant: 'default', title: 'Nothing imported' });
    }
  };

  const submitTabs = async (tabs: CapturedTab[], target: ImportTarget, closeImported: boolean) => {
    const result = await importTabsAndSyncLocalWithRaw(
      tabs.map((t) => ({ url: t.url, title: t.title })),
      {
        idempotencyKey: crypto.randomUUID(),
        target: target.type === 'inbox' ? { inbox: true } : { boardId: target.boardId },
        closeImported,
      },
    );
    setLastResult(result.counts);
    // Persist raw for details page
    try {
      sessionStorage.setItem(
        'tabseed:lastImportResult',
        JSON.stringify({ ...result.raw, savedAt: Date.now() }),
      );
    } catch {}
    return result.counts;
  };

  return (
    <div className="min-h-[60svh] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heading as="h1">Inbox</Heading>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="soft"
                className="rounded-full"
                aria-label="Import tabs"
                onClick={() => (extStatus === 'available' ? setOpen(true) : setOpenManual(true))}
              >
                <Plus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import tabs</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {lastResult ? (
        <Surface className="mb-4 p-3 text-sm">
          <div className="font-medium">Latest import result</div>
          <div className="mt-1 text-muted-foreground">
            created: {lastResult.created}, reused: {lastResult.reused}, ignored: {lastResult.ignored}
          </div>
        </Surface>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <Text size="sm" muted>
            Loading...
          </Text>
        ) : tabs.length === 0 ? (
          <EmptyState title="No tabs yet" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tabs.map((t) => (
              <TabCard
                key={t.id}
                id={t.id}
                url={t.url}
                title={t.title}
                color={t.color}
              />
            ))}
          </div>
        )}
      </div>

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
