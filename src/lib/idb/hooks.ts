"use client";

import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

import { getDb } from './db';
import type { TabRecord } from './types';

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

export function useAllTabsNewest(): {
  readonly tabs: readonly TabRecord[];
  readonly loading: boolean;
} {
  const [tabs, setTabs] = useState<readonly TabRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    const subscription = liveQuery(() => db.tabs.orderBy('id').reverse().toArray()).subscribe({
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
