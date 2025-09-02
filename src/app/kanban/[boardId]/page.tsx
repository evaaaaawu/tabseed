'use client';

import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ImportToColumnDialog } from '@/components/fab/import-to-column-dialog';
import { ManualImportDialog } from '@/components/fab/manual-import-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { useExtensionStatus } from '@/hooks/use-extension-status';
import { ApiError } from '@/lib/api/errors';
import { importTabsAndSyncLocalWithRaw } from '@/lib/data/import-tabs';
import { type CapturedTab, captureOpenTabs } from '@/lib/extension/bridge';
import { useColumns } from '@/lib/idb/columns-hooks';
import { addColumnAtEnd, ensureDefaultColumn, reorderColumns } from '@/lib/idb/columns-repo';
import { usePlacements } from '@/lib/idb/placements-hooks';
import { ensurePlacementsAtEnd } from '@/lib/idb/placements-repo';

function SortableColumnShell({
  id,
  boardId,
  name,
  onAddColumnAfter,
  onImportToThisColumn,
}: {
  id: string;
  boardId: string;
  name: string;
  onAddColumnAfter: (afterId: string) => Promise<void> | void;
  onImportToThisColumn: (columnId: string) => Promise<void> | void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  const { placements } = usePlacements(boardId, id);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full w-72 shrink-0 rounded-md border bg-card p-3 shadow-elev-1"
      {...attributes}
      {...listeners}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heading as="h3" className="truncate text-base">
            {name}
          </Heading>
          <span className="text-sm text-muted-foreground">{placements.length}</span>
        </div>
        <Button
          size="sm"
          className="h-7 w-7 rounded-md p-0"
          aria-label="Add column"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => void onAddColumnAfter(id)}
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </Button>
      </div>
      <div className="space-y-2" />
      <button
        className="mt-3 w-full rounded-md px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          void onImportToThisColumn(id);
        }}
      >
        + Import tabs
      </button>
    </div>
  );
}

export default function KanbanBoardPage({ params }: { params: { boardId: string } }) {
  const boardId = params.boardId;
  const sensors = useSensors(useSensor(PointerSensor));
  const { columns, loading } = useColumns(boardId);
  const [ids, setIds] = useState<string[]>([]);
  const { addToast } = useToast();
  const extStatus = useExtensionStatus();
  const [openManual, setOpenManual] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  useEffect(() => {
    // ensure default column exists
    void ensureDefaultColumn(boardId);
  }, [boardId]);

  useEffect(() => {
    setIds(columns.map((c) => c.id));
  }, [columns]);

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    const next = arrayMove(ids, oldIndex, newIndex);
    setIds(next);
    await reorderColumns(boardId, next);
  };

  const handleAddColumnAfter = async (afterId: string): Promise<void> => {
    try {
      const created = await addColumnAtEnd(boardId, 'New Column');
      const at = ids.indexOf(afterId);
      if (at >= 0) {
        const next = [...ids];
        next.splice(at + 1, 0, created.id);
        setIds(next);
        await reorderColumns(boardId, next);
      }
    } catch (e) {
      const err = e as Error;
      if (err.message === 'column_limit_reached') {
        addToast({ variant: 'warning', title: 'Column limit reached', description: 'You can create up to 50 columns per board.' });
        return;
      }
      addToast({ variant: 'error', title: 'Failed to add column' });
    }
  };

  const submitTabsToColumn = async (
    tabs: CapturedTab[],
    columnId: string,
    closeImported: boolean,
  ): Promise<{ created: number; reused: number; ignored: number }> => {
    const result = await importTabsAndSyncLocalWithRaw(
      tabs.map((t) => ({ url: t.url, title: t.title })),
      {
        idempotencyKey: crypto.randomUUID(),
        target: { boardId, columnId },
        closeImported,
      },
    );
    // After syncing tabs to IDB, also ensure placements into this column
    const tabIds = [...result.raw.created, ...result.raw.reused].map((t) => t.id);
    if (tabIds.length > 0) {
      await ensurePlacementsAtEnd({ boardId, columnId, tabIds });
    }
    try {
      sessionStorage.setItem(
        'tabseed:lastImportResult',
        JSON.stringify({ ...result.raw, savedAt: Date.now() }),
      );
    } catch {}
    return result.counts;
  };

  const handleImportToColumn = async (columnId: string): Promise<void> => {
    setTargetColumnId(columnId);
    setOpenImportDialog(true);
  };

  const gridClass = useMemo(() => 'flex gap-3 overflow-x-auto pb-4', []);

  return (
    <div className="min-h-[60svh] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Heading as="h1">Kanban</Heading>
      </div>

      {loading ? (
        <Text size="sm" muted>
          Loading...
        </Text>
      ) : ids.length === 0 ? (
        <EmptyState title="No columns yet" />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
            <div className={gridClass}>
              {ids.map((id) => {
                const col = columns.find((c) => c.id === id)!;
                return (
                  <SortableColumnShell
                    key={id}
                    id={id}
                    boardId={boardId}
                    name={col.name}
                    onAddColumnAfter={handleAddColumnAfter}
                    onImportToThisColumn={handleImportToColumn}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ImportToColumnDialog
        open={openImportDialog}
        onOpenChange={(o) => {
          setOpenImportDialog(o);
          if (!o) setTargetColumnId(null);
        }}
        onConfirm={async ({ closeImported }) => {
          const columnId = targetColumnId;
          if (!columnId) return;
          try {
            if (extStatus === 'available') {
              const tabs = await captureOpenTabs({ closeImported });
              if (tabs.length === 0) {
                setOpenImportDialog(false);
                setOpenManual(true);
                return;
              }
              const r = await submitTabsToColumn(tabs, columnId, closeImported);
              if (r.created > 0 && r.reused === 0) {
                addToast({ variant: 'success', title: 'Imported', description: `${r.created} new ${r.created === 1 ? 'tab' : 'tabs'} added`, linkHref: '/import/result', linkLabel: 'View details' });
              } else if (r.created > 0 && r.reused > 0) {
                addToast({ variant: 'warning', title: 'Partially imported', description: `${r.created} new, ${r.reused} already exist`, linkHref: '/import/result', linkLabel: 'View details' });
              } else if (r.created === 0 && r.reused > 0) {
                addToast({ variant: 'warning', title: 'All duplicates', description: `${r.reused} link${r.reused === 1 ? '' : 's'} already in your library`, linkHref: '/import/result', linkLabel: 'View details' });
              } else {
                addToast({ variant: 'default', title: 'Nothing imported' });
              }
            } else {
              setOpenImportDialog(false);
              setOpenManual(true);
            }
          } catch (err) {
            if (err instanceof ApiError && err.isUnauthorized) {
              window.location.href = '/login';
              return;
            }
            addToast({ variant: 'error', title: 'Import failed', description: (err as Error).message });
            throw err as Error;
          }
        }}
        onSwitchToManual={() => {
          setOpenImportDialog(false);
          setOpenManual(true);
        }}
      />

      <ManualImportDialog
        open={openManual}
        onOpenChange={(o) => {
          setOpenManual(o);
          if (!o) setTargetColumnId(null);
        }}
        onSubmit={async (tabs) => {
          const columnId = targetColumnId;
          if (!columnId) return;
          const r = await submitTabsToColumn(tabs, columnId, false);
          if (r.created > 0 && r.reused === 0) {
            addToast({ variant: 'success', title: 'Imported', description: `${r.created} new added`, linkHref: '/import/result', linkLabel: 'View details' });
          } else if (r.created > 0 && r.reused > 0) {
            addToast({ variant: 'warning', title: 'Partially imported', description: `${r.created} new, ${r.reused} exist`, linkHref: '/import/result', linkLabel: 'View details' });
          } else if (r.created === 0 && r.reused > 0) {
            addToast({ variant: 'warning', title: 'All duplicates', description: `${r.reused} already exist`, linkHref: '/import/result', linkLabel: 'View details' });
          } else {
            addToast({ variant: 'default', title: 'Nothing imported' });
          }
        }}
      />
    </div>
  );
}
