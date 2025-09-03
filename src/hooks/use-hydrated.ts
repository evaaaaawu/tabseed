'use client';

import { useEffect, useState } from 'react';

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    try {
      sessionStorage.setItem('tabseed.__hydrated', '1');
    } catch {}
  }, []);
  return hydrated;
}
