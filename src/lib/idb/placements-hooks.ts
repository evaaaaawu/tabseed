"use client";

import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

import { getDb } from './db';
import type { TabPlacementRecord } from './types';

export function usePlacements(boardId: string, columnId?: string): {
  readonly placements: readonly TabPlacementRecord[];
  readonly loading: boolean;
} {
  const [placements, setPlacements] = useState<readonly TabPlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const sub = liveQuery(() =>
      columnId
        ? db.placements.where({ boardId, columnId }).sortBy('orderIndex')
        : db.placements.where('boardId').equals(boardId).sortBy('orderIndex'),
    ).subscribe({
      next: (rows) => {
        setPlacements(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, [boardId, columnId]);

  return { placements, loading };
}


