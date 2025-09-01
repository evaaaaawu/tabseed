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

function SortableColumnShell({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-full w-72 shrink-0 rounded-md border bg-card p-3 shadow-elev-1"
      {...attributes}
      {...listeners}
    >
      <div className="mb-2 flex items-center justify-between">
        <Heading as="h3" className="truncate text-base">
          {name}
        </Heading>
      </div>
      <div className="space-y-2">
        {/* Placeholder static card list; will be fed by placements in next step */}
        <TabCard id={`placeholder-${id}`} url="#" title="Example card" />
      </div>
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

  const handleAddColumn = async (): Promise<void> => {
    try {
      await addColumnAtEnd(boardId, 'New Column');
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
        <Button
          size="sm"
          className="ml-2 rounded-full"
          onClick={handleAddColumn}
          aria-label="Add column"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </Button>
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
                return <SortableColumnShell key={id} id={id} name={col.name} />;
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
