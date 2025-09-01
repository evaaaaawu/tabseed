"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Surface } from '@/components/ui/surface';
import { useToast } from '@/components/ui/toast';
import { Heading, Text } from '@/components/ui/typography';
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

  return (
    <div className="min-h-[60svh] p-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Heading as="h1">Kanban</Heading>
          <Button size="sm" onClick={handleCreate} disabled={!canCreate}>
            New Kanban
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{count}</span>
          <span>/</span>
          <span>{MAX_BOARDS}</span>
        </div>
      </div>
      {!canCreate ? (
        <div className="mb-3 text-sm text-muted-foreground">已達 100 個 Kanban 上限，請刪除一些後再建立新 Kanban。</div>
      ) : null}

      <Surface className="mb-4 p-3">
        <Text size="sm" muted>
          Create Kanban spaces to organize your tabs. Newest first.
        </Text>
      </Surface>

      {loading ? (
        <Text size="sm" muted>
          Loading...
        </Text>
      ) : boards.length === 0 ? (
        <EmptyState
          title="No Kanban yet"
          description="Create your first Kanban space. You can rename it immediately."
          action={
            <Button onClick={handleCreate} disabled={!canCreate}>
              Create Kanban
            </Button>
          }
        />
      ) : (
        <div className={`grid gap-3 ${gridCols}`}>
          {boards.map((b) => (
            <div
              key={b.id}
              className="group cursor-default rounded-md border p-3 transition-colors hover:bg-accent/40"
              onDoubleClick={() => router.push(`/kanban/${b.id}`)}
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
                >
                  <Input
                    ref={inputRef}
                    name="name"
                    defaultValue={b.name}
                    placeholder="Untitled"
                    onBlur={(e) => void handleCommitName(b.id, e.currentTarget.value)}
                  />
                </form>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="line-clamp-2 text-base font-medium">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(b.id)}>
                    Rename
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
