// Content script: bridges page <-> extension background via window.postMessage
(function () {
  const SRC_PAGE = 'tabseed-page';
  const SRC_EXT = 'tabseed-extension';

  function isValidEvent(event) {
    // Only accept messages from same window
    if (event.source !== window) return false;
    const data = event.data;
    return data && typeof data === 'object' && data.source === SRC_PAGE;
  }

  window.addEventListener('message', (event) => {
    if (!isValidEvent(event)) return;
    const { type, payload } = event.data;

    switch (type) {
      case 'PING': {
        window.postMessage({ source: SRC_EXT, type: 'PONG' }, '*');
        break;
      }
      case 'CAPTURE_TABS': {
        const closeImported = !!(payload && payload.closeImported);
        try {
          if (!chrome || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
            throw new Error('runtime_unavailable');
          }
          chrome.runtime.sendMessage({ type: 'capture-tabs', closeImported }, (response) => {
            try {
              // lastError indicates background unavailable or other runtime errors
              // eslint-disable-next-line no-unused-expressions
              chrome.runtime.lastError; // access to trigger potential errors visibility in devtools
            } catch (_) {
              // ignore
            }
            window.postMessage(
              { source: SRC_EXT, type: 'CAPTURE_TABS_RESULT', payload: response || { ok: false } },
              '*',
            );
          });
        } catch (e) {
          window.postMessage(
            { source: SRC_EXT, type: 'CAPTURE_TABS_RESULT', payload: { ok: false, error: String(e && e.message ? e.message : e) } },
            '*',
          );
        }
        break;
      }
      default:
        break;
    }
  });
})();
