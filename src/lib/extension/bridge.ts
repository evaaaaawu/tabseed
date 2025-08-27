"use client";

export type CapturedTab = { url: string; title?: string };

export type CaptureOptions = {
  readonly closeImported?: boolean;
};

export function isExtensionAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).chrome?.runtime?.id !== 'undefined';
}

export async function captureOpenTabs(options?: CaptureOptions): Promise<CapturedTab[]> {
  if (!isExtensionAvailable()) {
    return [{ url: window.location.href, title: document.title }];
  }

  return await new Promise<CapturedTab[]>((resolve, reject) => {
    try {
      (window as any).chrome.runtime.sendMessage(
        { type: 'capture-tabs', closeImported: options?.closeImported ?? false },
        (response: any) => {
          if ((window as any).chrome.runtime.lastError) {
            resolve([{ url: window.location.href, title: document.title }]);
            return;
          }
          if (!response?.ok) {
            resolve([{ url: window.location.href, title: document.title }]);
            return;
          }
          resolve(response.tabs as CapturedTab[]);
        },
      );
    } catch (err) {
      resolve([{ url: window.location.href, title: document.title }]);
    }
  });
}
