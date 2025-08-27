"use client";

export type CapturedTab = { url: string; title?: string };

export type CaptureOptions = {
  readonly closeImported?: boolean;
};

export function isExtensionAvailable(): boolean {
  // Check for content script by doing a round-trip ping via window.postMessage
  if (typeof window === 'undefined') return false;
  return true;
}

export async function captureOpenTabs(options?: CaptureOptions): Promise<CapturedTab[]> {
  return await new Promise<CapturedTab[]>((resolve) => {
    let settled = false;
    const SRC_EXT = 'tabseed-extension';
    const SRC_PAGE = 'tabseed-page';

    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve([{ url: window.location.href, title: document.title }]);
      window.removeEventListener('message', onMessage);
    }, 800);

    function onMessage(event: MessageEvent) {
      if (event.source !== window) return;
      const data = event.data as { source?: string; type?: string; payload?: unknown };
      if (!data || data.source !== SRC_EXT) return;
      if (data.type === 'CAPTURE_TABS_RESULT') {
        window.clearTimeout(timeout);
        if (settled) return;
        settled = true;
        const payload = data.payload as { ok?: boolean; tabs?: CapturedTab[] } | undefined;
        resolve(payload?.ok ? payload.tabs ?? [] : [{ url: window.location.href, title: document.title }]);
        window.removeEventListener('message', onMessage);
      }
    }

    window.addEventListener('message', onMessage);
    window.postMessage(
      { source: SRC_PAGE, type: 'CAPTURE_TABS', payload: { closeImported: !!options?.closeImported } },
      '*',
    );
  });
}
