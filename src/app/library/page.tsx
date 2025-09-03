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
          </div>
        )}
      </div>
    </div>
  );
}
