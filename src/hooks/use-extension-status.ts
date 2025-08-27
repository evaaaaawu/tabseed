"use client";

import { useEffect, useState } from 'react';

import { pingExtension } from '@/lib/extension/bridge';

export type ExtensionStatus = 'unknown' | 'available' | 'unavailable';

export function useExtensionStatus(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>('unknown');

  useEffect(() => {
    let mounted = true;
    pingExtension(400)
      .then((ok) => mounted && setStatus(ok ? 'available' : 'unavailable'))
      .catch(() => mounted && setStatus('unavailable'));
    return () => {
      mounted = false;
    };
  }, []);

  return status;
}


