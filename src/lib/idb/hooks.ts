"use client";

import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

import type { TabRecord } from './types';
import { getDb } from './db';

export function useAllTabs(): { readonly tabs: readonly TabRecord[]; readonly loading: boolean } {
  const [tabs, setTabs] = useState<readonly TabRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const subscription = liveQuery(() => db.tabs.orderBy('id').toArray()).subscribe({
      next: (rows) => {
        setTabs(rows);
        setLoading(false);
      },
      error: () => {
        setLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  return { tabs, loading };
}


