'use client';

import { useState } from 'react';

import { TabCard } from '@/components/tabs/tab-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { useHydrated } from '@/hooks/use-hydrated';
import { useAllTabsNewest } from '@/lib/idb/hooks';

export default function LibraryPage() {
  const hydrated = useHydrated();
  const { tabs, loading } = useAllTabsNewest();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (
    id: string,
    modifiers?: { shiftKey?: boolean; metaKey?: boolean; ctrlKey?: boolean },
  ) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if ((modifiers?.metaKey || modifiers?.ctrlKey) && next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!modifiers?.shiftKey && !modifiers?.metaKey && !modifiers?.ctrlKey && next.has(id)) {
        next.delete(id);
        return next;
      }
      if (modifiers?.shiftKey && next.size > 0) {
        // 簡化：用當前列表最後選取為 anchor
        const indices = [...next].map((x) => tabs.findIndex((t) => t.id === x)).filter((i) => i >= 0).sort((a, b) => a - b);
        const anchor = indices.length > 0 ? indices[indices.length - 1] : 0;
        const target = tabs.findIndex((t) => t.id === id);
        const [start, end] = anchor <= target ? [anchor, target] : [target, anchor];
        for (let i = start; i <= end; i++) next.add(tabs[i]!.id);
        return next;
      }
      if (modifiers?.metaKey || modifiers?.ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      next.clear();
      next.add(id);
      return next;
    });
  };

  // Marquee selection state & handlers (mirror Inbox)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === 'mouse' && e.buttons !== 1) return;
    if (e.shiftKey || e.metaKey || e.ctrlKey) return;
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
    const isClick = !!dragRect && dragRect.width < 3 && dragRect.height < 3;
    if (isClick) {
      setSelected(new Set());
    } else {
      const sel = new Set(selected);
      nodes.forEach((node) => {
        const r = node.getBoundingClientRect();
        const nx = r.left - cRect.left;
        const ny = r.top - cRect.top;
        const intersects = dragRect && !(nx > dragRect.left + dragRect.width || nx + r.width < dragRect.left || ny > dragRect.top + dragRect.height || ny + r.height < dragRect.top);
        if (intersects) sel.add(node.dataset.itemId!);
      });
      setSelected(sel);
    }
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
    <div className="min-h-[60svh] p-6">
      <Heading as="h1" className="mb-8">
        Library
      </Heading>

      <div className="mt-4" role="grid" aria-label="Library tabs">
        {loading ? (
          <Text size="sm" muted>
            Loading...
          </Text>
        ) : !hydrated ? (
          <Text size="sm" muted>
            Loading...
          </Text>
        ) : tabs.length === 0 ? (
          <EmptyState
            title="No tabs yet"
          />
        ) : (
          <div
            className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            onClick={(e) => {
              // click empty area clears selection
              const isOnCell = (e.target as Element | null)?.closest?.('[role="gridcell"]');
              if (!isOnCell) setSelected(new Set());
            }}
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
                onSelect={toggleSelect}
              />
            ))}
            {dragRect ? (
              <div
                className="pointer-events-none absolute z-10 border-2 border-success/70 bg-success/10"
                style={{ left: dragRect.left, top: dragRect.top, width: dragRect.width, height: dragRect.height }}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
