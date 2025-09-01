import type { CapturedTab } from '@/lib/extension/bridge';

/**
 * Parse a Netscape Bookmark HTML file and extract tab data.
 * Supports standard bookmark export format from major browsers.
 *
 * @param file - The bookmark HTML file
 * @returns Promise resolving to array of captured tabs
 */
export async function parseBookmarksHtml(file: File): Promise<CapturedTab[]> {
  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');

  // Find all anchor elements with href attributes
  const anchors = Array.from(doc.querySelectorAll('a[href]'));

  type MaybeCaptured = CapturedTab | null;

  const tabs: CapturedTab[] = anchors
    .map<MaybeCaptured>((a) => {
      const url = a.getAttribute('href');
      const title = (a.textContent ?? '').trim();
      return url ? ({ url, title: title || undefined } as CapturedTab) : null;
    })
    .filter((tab): tab is CapturedTab => tab !== null && isValidUrl(tab.url));

  // Remove duplicates based on URL
  const seen = new Set<string>();
  const uniqueTabs = tabs.filter((tab) => {
    if (seen.has(tab.url)) return false;
    seen.add(tab.url);
    return true;
  });

  // Limit to prevent performance issues
  return uniqueTabs.slice(0, 1000);
}

/**
 * Basic URL validation to filter out invalid entries
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
