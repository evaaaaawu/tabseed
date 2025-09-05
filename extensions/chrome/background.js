// Minimal MV3 background service worker for capturing and closing tabs (JS)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (!message || typeof message.type !== 'string') {
      sendResponse({ ok: false, error: 'invalid_message' });
      return;
    }

    switch (message.type) {
      case 'ping': {
        sendResponse({ ok: true });
        return;
      }
      case 'capture-tabs': {
        const tabs = await chrome.tabs.query({});
        const currentTabId = sender.tab && sender.tab.id;
        const items = tabs
          .filter((t) => t.id !== currentTabId && typeof t.url === 'string' && !!t.url)
          .map((t) => ({ url: String(t.url), title: t.title || undefined, id: t.id }));

        if (message.closeImported) {
          for (const t of items) {
            if (typeof t.id === 'number') {
              try {
                await chrome.tabs.remove(t.id);
              } catch {
                // ignore close failures
              }
            }
          }
        }

        sendResponse({ ok: true, tabs: items.map((t) => ({ url: t.url, title: t.title })) });
        return;
      }
      default: {
        sendResponse({ ok: false, error: 'unknown_message' });
      }
    }
  })();
  return true;
});
