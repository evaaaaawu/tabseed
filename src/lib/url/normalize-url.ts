const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
]);

const QUERY_WHITELIST = new Set<string>();

function asciiCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function sortQueryParams(urlSearchParams: URLSearchParams): URLSearchParams {
  const entries = Array.from(urlSearchParams.entries())
    .filter(([key]) => !TRACKING_PARAMS.has(key))
    .sort(([aKey, aVal], [bKey, bVal]) => {
      const keyCmp = asciiCompare(aKey, bKey);
      if (keyCmp !== 0) return keyCmp;
      return asciiCompare(aVal, bVal);
    });
  const sorted = new URLSearchParams();
  for (const [key, value] of entries) sorted.append(key, value);
  return sorted;
}

function stripDefaultPorts(url: URL): void {
  if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }
}

function removeHashIfRedundant(url: URL): void {
  // Keep hash only if it's non-empty and not just '#'
  if (url.hash === '' || url.hash === '#') {
    url.hash = '';
  }
}

export function normalizeUrl(input: string): string {
  // Guard: ensure valid and http(s)
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    // Try to coerce missing protocol (e.g., example.com)
    try {
      url = new URL(`https://${input}`);
    } catch {
      return input.trim(); // Return as-is (trimmed) for invalid; caller validates
    }
  }

  if (!/^https?:$/.test(url.protocol)) {
    return url.toString();
  }

  // Lowercase host
  url.hostname = url.hostname.toLowerCase();

  // IDN: leave as punycode if already; URL will preserve

  // Remove default ports
  stripDefaultPorts(url);

  // Normalize pathname: decode then collapse multiple slashes, remove trailing slash except root
  if (url.pathname) {
    try {
      url.pathname = decodeURI(url.pathname);
    } catch {
      // ignore decode errors, keep as-is
    }
    url.pathname = url.pathname.replace(/\/{2,}/g, '/');
  }
  if (url.pathname !== '/') {
    url.pathname = url.pathname.replace(/\/$/, '');
  }

  // Query: remove tracking, optionally whitelist, and sort
  const originalQuery = new URLSearchParams(url.search);
  const filtered = new URLSearchParams();
  for (const [key, value] of originalQuery.entries()) {
    if (TRACKING_PARAMS.has(key)) continue;
    if (QUERY_WHITELIST.size > 0 && !QUERY_WHITELIST.has(key)) continue;
    // Keep empty values; normalize key casing exact
    filtered.append(key, value);
  }
  const sorted = sortQueryParams(filtered);
  const queryString = sorted.toString();
  url.search = queryString ? `?${queryString}` : '';

  // Hash: drop empty '#'
  removeHashIfRedundant(url);

  return url.toString();
}

export function isDuplicate(a: string, b: string): boolean {
  return normalizeUrl(a) === normalizeUrl(b);
}
