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
        chrome.runtime.sendMessage(
          { type: 'capture-tabs', closeImported },
          (response) => {
            window.postMessage({ source: SRC_EXT, type: 'CAPTURE_TABS_RESULT', payload: response }, '*');
          },
        );
        break;
      }
      default:
        break;
    }
  });
})();
