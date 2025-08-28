import type { CapturedTab } from '@/lib/extension/bridge';

/**
 * Parse text containing URLs (one per line) and extract tab data.
 * Each line can contain a URL optionally followed by a title.
 * 
 * @param input - Raw text input with URLs
 * @returns Array of captured tabs
 */
export function parseUrlsFromText(input: string): CapturedTab[] {
  const lines = input
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const tabs = lines
    .map(line => parseLineToTab(line))
    .filter((tab): tab is CapturedTab => tab !== null);

  // Remove duplicates based on URL
  const seen = new Set<string>();
  const uniqueTabs = tabs.filter(tab => {
    if (seen.has(tab.url)) return false;
    seen.add(tab.url);
    return true;
  });

  // Limit to prevent performance issues
  return uniqueTabs.slice(0, 1000);
}

/**
 * Parse a single line to extract URL and optional title.
 * Expected formats:
 * - "https://example.com"
 * - "https://example.com Optional Title Here"
 * - "Optional Title https://example.com More Title"
 */
function parseLineToTab(line: string): CapturedTab | null {
  const urlMatch = line.match(/\bhttps?:\/\/[^\s<>"']+/i);
  if (!urlMatch) return null;

  const url = urlMatch[0];
  if (!isValidUrl(url)) return null;

  // Extract title by removing the URL from the line
  const title = line.replace(url, '').trim() || undefined;

  return { url, title };
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
