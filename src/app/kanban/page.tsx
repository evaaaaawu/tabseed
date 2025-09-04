"use client";

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { BoardCard } from '@/components/boards/board-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
import { useGridMultiSelect } from '@/hooks/use-grid-multi-select';
import { useBoardsCount, useBoardsNewest } from '@/lib/idb/boards-hooks';
import { createBoardDraft, renameBoard } from '@/lib/idb/boards-repo';

const MAX_BOARDS = 100;

export default function KanbanIndexPage() {
  const { boards, loading } = useBoardsNewest();
  const { count } = useBoardsCount();
  const canCreate = count < MAX_BOARDS;
  const { addToast } = useToast();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleCreate = async (): Promise<void> => {
    if (!canCreate) {
      addToast({ variant: 'warning', title: 'Limit reached', description: 'You can create up to 100 Kanban boards.' });
      return;
    }
    const draft = await createBoardDraft();
    setEditingId(draft.id);
  };

  const handleCommitName = async (boardId: string, value: string): Promise<void> => {
    await renameBoard(boardId, value);
    setEditingId(null);
  };

  const gridCols = useMemo(() => 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', []);
  const { selectedIds, handleCardSelect, containerProps, dragRect } = useGridMultiSelect(boards);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (boards.length === 0) return;
    const focused = document.activeElement as HTMLElement | null;
    const cell = focused?.closest('[role="gridcell"]') as HTMLElement | null;
    const currentIndex = cell ? Array.from(cell.parentElement?.children ?? []).indexOf(cell) : -1;
    const cols =
      getComputedStyle(cell?.parentElement as Element)
        .getPropertyValue('grid-template-columns')
        .split(' ').length || 1;

    let nextIndex = -1;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(boards.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(boards.length - 1, currentIndex + cols);
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

  return (
    <div className="min-h-[60svh] p-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="mb-8 flex items-center gap-3">
          <Heading as="h1">Kanban</Heading>
          <Button size="sm" variant="secondary" onClick={handleCreate} disabled={!canCreate}>
            <Plus className="size-4" strokeWidth={2} />
            <span className="ml-1">Kanban</span>
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{count}</span>
            <span>/</span>
            <span>{MAX_BOARDS}</span>
          </div>
        </div>
      </div>
      {!canCreate ? (
        <div className="mb-3 text-sm text-muted-foreground">
          You have reached the limit of 100 Kanban boards.
        </div>
      ) : null}

      {loading ? (
        <Text size="sm" muted>
          Loading...
        </Text>
      ) : boards.length === 0 ? (
        <EmptyState
          title="No Kanban yet"
          action={
            <Button size="sm" variant="soft" onClick={handleCreate} disabled={!canCreate}>
              <Plus className="size-4" strokeWidth={2} />
              <span className="ml-1">Kanban</span>
            </Button>
          }
        />
      ) : (
        <div
          className={`relative grid gap-3 ${gridCols}`}
          role="grid"
          aria-label="Kanban boards"
          onKeyDown={onKeyDown}
          {...containerProps}
        >
          {boards.map((b) => (
            <BoardCard
              key={b.id}
              id={b.id}
              name={b.name}
              selected={selectedIds.has(b.id)}
              onSelect={handleCardSelect}
              onOpen={(id) => router.push(`/kanban/${id}`)}
            >
              {editingId === b.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const data = new FormData(form);
                    const value = String(data.get('name') ?? '');
                    void handleCommitName(b.id, value);
                  }}
                  // 防止在輸入時觸發父層選取
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <Input
                    ref={inputRef}
                    name="name"
                    defaultValue={b.name}
                    placeholder="Untitled"
                    onBlur={(e) => void handleCommitName(b.id, e.currentTarget.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                </form>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="line-clamp-2 text-base font-medium">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingId(b.id); }}>
                    Rename
                  </Button>
                </div>
              )}
            </BoardCard>
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
  );
}
