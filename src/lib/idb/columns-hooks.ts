'use client';

import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

import { getDb } from './db';
import type { KanbanColumnRecord } from './types';

export function useColumns(boardId: string): {
  readonly columns: readonly KanbanColumnRecord[];
  readonly loading: boolean;
} {
  const [columns, setColumns] = useState<readonly KanbanColumnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const sub = liveQuery(() =>
      db.columns.where('boardId').equals(boardId).sortBy('sortOrder'),
    ).subscribe({
      next: (rows) => {
        setColumns(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, [boardId]);

  return { columns, loading };
}
