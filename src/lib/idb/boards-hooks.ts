"use client";

import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

import { getDb } from './db';
import type { BoardRecord } from './types';

export function useBoardsNewest(): { readonly boards: readonly BoardRecord[]; readonly loading: boolean } {
  const [boards, setBoards] = useState<readonly BoardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const sub = liveQuery(() => db.boards.orderBy('createdAt').reverse().toArray()).subscribe({
      next: (rows) => {
        setBoards(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  return { boards, loading };
}

export function useBoardsCount(): { readonly count: number; readonly loading: boolean } {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const sub = liveQuery(() => db.boards.count()).subscribe({
      next: (c) => {
        setCount(c);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
    return () => sub.unsubscribe();
  }, []);

  return { count, loading };
}
