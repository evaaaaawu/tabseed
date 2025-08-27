"use client";

export type CapturedTab = { url: string; title?: string };

export type CaptureOptions = {
  readonly closeImported?: boolean;
};

export function isExtensionAvailable(): boolean {
  const w = typeof window !== 'undefined' ? (window as unknown as { chrome?: { runtime?: { id?: string } } }) : undefined;
  return !!w?.chrome?.runtime?.id;
}

export async function captureOpenTabs(options?: CaptureOptions): Promise<CapturedTab[]> {
  if (!isExtensionAvailable()) {
    return [{ url: window.location.href, title: document.title }];
  }

  return await new Promise<CapturedTab[]>((resolve) => {
    try {
      const w = window as unknown as {
        chrome?: {
          runtime?: {
            sendMessage?: (
              msg: { type: 'capture-tabs'; closeImported: boolean },
              cb: (resp: { ok?: boolean; tabs?: CapturedTab[] } | undefined) => void,
            ) => void;
            lastError?: unknown;
          };
        };
      };

      w.chrome?.runtime?.sendMessage?.(
        { type: 'capture-tabs', closeImported: options?.closeImported ?? false },
        (response) => {
          if (w.chrome?.runtime?.lastError) {
            resolve([{ url: window.location.href, title: document.title }]);
            return;
          }
          if (!response?.ok) {
            resolve([{ url: window.location.href, title: document.title }]);
            return;
          }
          resolve(response.tabs ?? []);
        },
      );
    } catch {
      resolve([{ url: window.location.href, title: document.title }]);
    }
  });
}
