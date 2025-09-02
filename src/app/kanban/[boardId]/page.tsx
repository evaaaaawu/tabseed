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

import { TabCard } from '@/components/tabs/tab-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { useColumns } from '@/lib/idb/columns-hooks';
import { addColumnAtEnd, ensureDefaultColumn, reorderColumns } from '@/lib/idb/columns-repo';
import { usePlacements } from '@/lib/idb/placements-hooks';

function SortableColumnShell({
  id,
  boardId,
  name,
  onAddColumnAfter,
}: {
  id: string;
  boardId: string;
  name: string;
  onAddColumnAfter: (afterId: string) => Promise<void> | void;
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
      <div className="space-y-2">
        {/* Placeholder static card list; will be fed by placements in next step */}
        <TabCard id={`placeholder-${id}`} url="#" title="Example card" />
      </div>
      <button className="mt-3 w-full rounded-md px-2 py-1 text-left text-sm text-muted-foreground hover:bg-accent">
        + New card
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
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
