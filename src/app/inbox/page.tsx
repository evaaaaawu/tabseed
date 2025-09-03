"use client";

import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { type ImportTarget, ImportTargetDialog } from '@/components/fab/import-to-inbox-dialog';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { TabCard } from '@/components/tabs/tab-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { importTabsAndSyncLocalWithRaw } from '@/lib/data/import-tabs';
import { type CapturedTab, captureOpenTabs } from '@/lib/extension/bridge';
import { useInboxTabsNewest } from '@/lib/idb/hooks';
import { ensureInboxAtEnd } from '@/lib/idb/inbox-repo';

export default function InboxPage() {
  const [open, setOpen] = useState(false);
  const [openManual, setOpenManual] = useState(false);
  const extStatus = useExtensionStatus();
  const { addToast } = useToast();
  const { tabs, loading } = useInboxTabsNewest();
  // store raw result to sessionStorage for details page

  const searchParams = useSearchParams();

  // Open manual import dialog when query `?manualImport=1` is present
  useEffect(() => {
    const manual = searchParams.get('manualImport');
    if (manual) {
      setOpenManual(true);
      // Clean the query to avoid reopening on refresh/back
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('manualImport');
        window.history.replaceState(null, '', url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''));
      } catch {}
    }
  }, [searchParams]);

  const handleConfirm = async (target: ImportTarget, options: { closeImported: boolean }) => {
    try {
      const tabs = await captureOpenTabs({ closeImported: options.closeImported });

      // If no tabs captured, show toast with link to manual import instead of opening it directly
      if (tabs.length === 0) {
        setOpen(false);
        addToast({
          variant: 'warning',
          title: 'No tabs to import',
          description: 'There are no importable tabs right now.',
          linkHref: '?manualImport=1',
          linkLabel: 'Open manual import',
          durationMs: 8000,
        });
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

  const submitTabs = async (tabs: CapturedTab[], _target: ImportTarget, closeImported: boolean) => {
    const result = await importTabsAndSyncLocalWithRaw(
      tabs.map((t) => ({ url: t.url, title: t.title })),
      {
        idempotencyKey: crypto.randomUUID(),
        target: { inbox: true },
        closeImported,
      },
    );
    // Ensure inbox membership for created + reused tabs
    const tabIds = [...result.raw.created, ...result.raw.reused].map((t) => t.id);
    if (tabIds.length > 0) await ensureInboxAtEnd(tabIds);
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
      <div className="mb-8 flex items-center gap-2">
        <Heading as="h1">Inbox</Heading>
        <Button
          size="sm"
          variant="default"
          className="ml-2"
          aria-label="Import tabs"
          onClick={() => (extStatus === 'available' ? setOpen(true) : setOpenManual(true))}
        >
          <Plus className="mr-2 last:size-4" strokeWidth={2.5} />
          Import tabs
        </Button>
      </div>

      <div className="mt-4" role="grid" aria-label="Inbox tabs">
        {loading ? (
          <Text size="sm" muted>
            Loading...
          </Text>
        ) : tabs.length === 0 ? (
          <EmptyState title="No tabs in inbox" />
        ) : (
          <GridTabs tabs={tabs} />
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

function GridTabs({ tabs }: { tabs: ReadonlyArray<{ id: string; url: string; title?: string; color?: string }> }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const onSelect = (id: string, modifiers?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // 已選且有 Ctrl/Meta 或無修飾 → 允許取消選取
      if ((modifiers?.metaKey || modifiers?.ctrlKey) && next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!modifiers?.shiftKey && !modifiers?.metaKey && !modifiers?.ctrlKey && next.has(id)) {
        next.delete(id);
        return next;
      }
      // Shift 多選：連續區間（簡化：若有已選，取最後一個的 index 作區間）
      if (modifiers?.shiftKey && next.size > 0) {
        const indices = [...next].map((x) => tabs.findIndex((t) => t.id === x)).filter((i) => i >= 0).sort((a, b) => a - b);
        const anchor = indices.length > 0 ? indices[indices.length - 1] : 0;
        const target = tabs.findIndex((t) => t.id === id);
        const [start, end] = anchor <= target ? [anchor, target] : [target, anchor];
        for (let i = start; i <= end; i++) next.add(tabs[i]!.id);
        return next;
      }
      // Meta/Ctrl：切換單一
      if (modifiers?.metaKey || modifiers?.ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      // 單選：只保留此項
      next.clear();
      next.add(id);
      return next;
    });
  };

  const idToIndex = useMemo(() => new Map(tabs.map((t, i) => [t.id, i])), [tabs]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (tabs.length === 0) return;
    const focused = document.activeElement as HTMLElement | null;
    const cell = focused?.closest('[role="gridcell"]') as HTMLElement | null;
    const currentIndex = cell ? Array.from(cell.parentElement?.children ?? []).indexOf(cell) : -1;
    const cols = getComputedStyle(cell?.parentElement as Element).getPropertyValue('grid-template-columns').split(' ').length || 1;

    let nextIndex = -1;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(tabs.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(tabs.length - 1, currentIndex + cols);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(0, currentIndex - cols);
        break;
      default:
        return;
    }
    if (nextIndex >= 0 && nextIndex !== currentIndex) {
      e.preventDefault();
      const grid = cell?.parentElement;
      const target = grid?.children.item(nextIndex) as HTMLElement | null;
      target?.focus();
    }
  };

  // Marquee selection state
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    // mouse: only start when primary button is pressed
    if (e.pointerType === 'mouse' && e.buttons !== 1) return;
    // Do not start marquee when using selection modifiers; let card click handle shift/meta/ctrl logic
    if (e.shiftKey || e.metaKey || e.ctrlKey) return;
    // Do not start marquee if the pointerdown originated on a card
    const isOnCell = (e.target as Element | null)?.closest?.('[role="gridcell"]');
    if (isOnCell) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setDragRect({ left: x, top: y, width: 0, height: 0 });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    // avoid page scroll on touchpad/touch while drawing marquee
    e.preventDefault();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const left = Math.min(dragStart.x, x);
    const top = Math.min(dragStart.y, y);
    const width = Math.abs(x - dragStart.x);
    const height = Math.abs(y - dragStart.y);
    setDragRect({ left, top, width, height });
    e.preventDefault();
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return;
    const container = e.currentTarget as HTMLElement;
    const nodes = Array.from(container.querySelectorAll('[role="gridcell"]')) as HTMLElement[];
    const cRect = container.getBoundingClientRect();
    const sel = new Set(selected);
    nodes.forEach((node) => {
      const r = node.getBoundingClientRect();
      const nx = r.left - cRect.left;
      const ny = r.top - cRect.top;
      const intersects = dragRect && !(nx > dragRect.left + dragRect.width || nx + r.width < dragRect.left || ny > dragRect.top + dragRect.height || ny + r.height < dragRect.top);
      if (intersects) sel.add(node.dataset.itemId!);
    });
    setSelected(sel);
    setDragStart(null);
    setDragRect(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    e.preventDefault();
  };

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragStart(null);
    setDragRect(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {tabs.map((t) => (
        <TabCard
          key={t.id}
          id={t.id}
          url={t.url}
          title={t.title}
          color={t.color}
          selected={selected.has(t.id)}
          onSelect={onSelect}
        />
      ))}
      {dragRect ? (
        <div
          className="pointer-events-none absolute z-10 border-2 border-success/70 bg-success/10"
          style={{ left: dragRect.left, top: dragRect.top, width: dragRect.width, height: dragRect.height }}
        />
      ) : null}
    </div>
  );
}
