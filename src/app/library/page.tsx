'use client';

// no-op

import { TabCard } from '@/components/tabs/tab-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { useGridMultiSelect } from '@/hooks/use-grid-multi-select';
import { useHydrated } from '@/hooks/use-hydrated';
import { useAllTabsNewest } from '@/lib/idb/hooks';

export default function LibraryPage() {
  const hydrated = useHydrated();
  const { tabs, loading } = useAllTabsNewest();
  const { selectedIds, handleCardSelect, containerProps, dragRect } = useGridMultiSelect(tabs);

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
          <EmptyState title="No tabs yet" />
        ) : (
          <div
            className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            {...containerProps}
          >
            {tabs.map((t) => (
              <TabCard
                key={t.id}
                id={t.id}
                url={t.url}
                title={t.title}
                color={t.color}
                selected={selectedIds.has(t.id)}
                onSelect={handleCardSelect}
              />
            ))}
            {dragRect ? (
              <div
                className="pointer-events-none absolute z-10 border-2 border-success/70 bg-success/10"
                style={{
                  left: dragRect.left,
                  top: dragRect.top,
                  width: dragRect.width,
                  height: dragRect.height,
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
