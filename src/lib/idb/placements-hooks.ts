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

export function usePlacementsWithTabs(boardId: string, columnId: string): {
  readonly items: ReadonlyArray<{ placement: TabPlacementRecord; tab: import('./types').TabRecord | undefined }>;
  readonly loading: boolean;
} {
  const [items, setItems] = useState<ReadonlyArray<{ placement: TabPlacementRecord; tab: import('./types').TabRecord | undefined }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const sub = liveQuery(async () => {
      const placements = await db.placements.where({ boardId, columnId }).sortBy('orderIndex');
      const tabsMap = new Map<string, import('./types').TabRecord>();
      const uniqueTabIds = Array.from(new Set(placements.map((p) => p.tabId)));
      if (uniqueTabIds.length > 0) {
        const rows = await db.tabs.bulkGet(uniqueTabIds);
        for (const row of rows) if (row) tabsMap.set(row.id, row);
      }
      return placements.map((p) => ({ placement: p, tab: tabsMap.get(p.tabId) }));
    }).subscribe({
      next: (rows) => {
        setItems(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, [boardId, columnId]);

  return { items, loading };
}
