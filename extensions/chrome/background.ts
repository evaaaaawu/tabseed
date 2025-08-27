// Minimal MV3 background service worker for capturing and closing tabs

type CaptureTabsRequest = {
  type: 'capture-tabs';
  closeImported?: boolean;
};

type PingRequest = { type: 'ping' };

type Request = CaptureTabsRequest | PingRequest;

chrome.runtime.onMessage.addListener((message: Request, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'ping': {
        sendResponse({ ok: true });
        return;
      }
      case 'capture-tabs': {
        const tabs = await chrome.tabs.query({});
        const currentTabId = sender.tab?.id;
        const items = tabs
          .filter((t) => t.id !== currentTabId && typeof t.url === 'string' && !!t.url)
          .map((t) => ({ url: String(t.url), title: t.title ?? undefined, id: t.id }));

        if (message.closeImported) {
          for (const t of items) {
            if (typeof t.id === 'number') {
              try {
                await chrome.tabs.remove(t.id);
              } catch {
                // ignore
              }
            }
          }
        }

        sendResponse({ ok: true, tabs: items.map(({ id, ...rest }) => rest) });
        return;
      }
    }
  })();

  // Indicate async response
  return true;
});


