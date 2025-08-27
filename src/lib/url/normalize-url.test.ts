import { describe, expect, it } from 'vitest';

import { isDuplicate, normalizeUrl } from './normalize-url';

// Helper
const n = (u: string) => normalizeUrl(u);

describe('normalizeUrl', () => {
  it('resolves dot-segments per WHATWG URL', () => {
    expect(n('https://example.com/a/../b')).toBe('https://example.com/b');
  });

  it('removes http default port 80 in presence of query/hash', () => {
    expect(n('http://example.com:80/?a=1#x')).toBe('http://example.com/?a=1#x');
  });

  it('removes https default port 443 in presence of path', () => {
    expect(n('https://example.com:443/a')).toBe('https://example.com/a');
  });

  it('keeps non-empty hash', () => {
    expect(n('https://example.com/#section')).toBe('https://example.com/#section');
  });

  it('handles duplicate query keys with different casing (case-sensitive)', () => {
    expect(n('https://example.com?a=1&A=2')).toBe('https://example.com/?A=2&a=1');
  });

  it('drops only known trackers and keeps others starting with utm-like but different', () => {
    expect(n('https://example.com?utmx=1&utm_source=2')).toBe('https://example.com/?utmx=1');
  });

  it('removes trailing slash after path segments but not root', () => {
    expect(n('https://example.com/a/')).toBe('https://example.com/a');
  });

  it('normalizes spaces in query to + (URLSearchParams)', () => {
    expect(n('https://example.com?a=%2F%2F&b=%20')).toBe('https://example.com/?a=%2F%2F&b=+');
  });

  it('sorts query values when keys equal', () => {
    expect(n('https://example.com?a=2&a=1&a=10')).toBe('https://example.com/?a=1&a=10&a=2');
  });

  it('keeps order of identical duplicates', () => {
    expect(n('https://example.com?a=1&a=1&a=1')).toBe('https://example.com/?a=1&a=1&a=1');
  });

  it('handles empty query string gracefully', () => {
    expect(n('https://example.com?')).toBe('https://example.com/');
  });

  it('handles query param without value', () => {
    expect(n('https://example.com?a&b=')).toBe('https://example.com/?a=&b=');
  });

  it('preserves subdomains and lowercases only host', () => {
    expect(n('https://WWW.Sub.EXAMPLE.com/')).toBe('https://www.sub.example.com/');
  });

  it('does not change path case', () => {
    expect(n('https://example.com/Case/Path')).toBe('https://example.com/Case/Path');
  });

  it('collapses multiple slashes between segments only', () => {
    expect(n('https://example.com/a//b///c')).toBe('https://example.com/a/b/c');
  });

  it('lowercases host and strips default ports', () => {
    expect(n('HTTP://Example.COM:80')).toBe('http://example.com/');
    expect(n('https://Example.COM:443/Path/')).toBe('https://example.com/Path');
  });

  it('removes trailing slash except root', () => {
    expect(n('https://example.com/')).toBe('https://example.com/');
    expect(n('https://example.com/path/')).toBe('https://example.com/path');
  });

  it('collapses multiple slashes in pathname', () => {
    expect(n('https://example.com//a///b//c/')).toBe('https://example.com/a/b/c');
  });

  it('removes tracking params and sorts query params', () => {
    expect(n('https://example.com?a=2&utm_source=x&b=1')).toBe('https://example.com/?a=2&b=1');
    expect(n('https://example.com?b=1&a=2')).toBe('https://example.com/?a=2&b=1');
  });

  it('keeps empty query values and repeated params, sorted by key then value', () => {
    expect(n('https://example.com?z=&z=2&y')).toBe('https://example.com/?y=&z=&z=2');
  });

  it('drops empty hash', () => {
    expect(n('https://example.com/#')).toBe('https://example.com/');
    expect(n('https://example.com/#section')).toBe('https://example.com/#section');
  });

  it('resolves protocol-less input by assuming https', () => {
    expect(n('Example.com/Path')).toBe('https://example.com/Path');
  });

  it('preserves non-http(s) protocols as-is', () => {
    expect(n('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(n('chrome://version')).toBe('chrome://version');
  });

  it('handles IDN/punycode domains', () => {
    // ä -> xn--4ca
    expect(n('https://xn--4ca.example.com/')).toBe('https://xn--4ca.example.com/');
  });

  it('removes known trackers: utm_*, gclid, fbclid', () => {
    expect(n('https://example.com?a=1&utm_medium=em&gclid=abc&fbclid=def')).toBe('https://example.com/?a=1');
  });

  it('keeps order-insensitive queries same after normalization', () => {
    const u1 = 'https://example.com/path?b=2&a=1&a=3';
    const u2 = 'https://EXAMPLE.com/path/?a=3&a=1&b=2';
    expect(n(u1)).toBe(n(u2));
  });

  it('strips https default port 443 and http 80', () => {
    expect(n('https://example.com:443')).toBe('https://example.com/');
    expect(n('http://example.com:80')).toBe('http://example.com/');
  });

  it('does not over-normalize different paths', () => {
    expect(n('https://example.com/a')).not.toBe(n('https://example.com/b'));
  });

  it('does not strip non-tracking query keys', () => {
    expect(n('https://example.com?a=1&ref=x')).toBe('https://example.com/?a=1&ref=x');
  });

  it('handles hash-only difference as same when hash is empty only', () => {
    expect(n('https://example.com/#')).toBe(n('https://example.com/'));
    expect(n('https://example.com/#x')).not.toBe(n('https://example.com/'));
  });

  it('treats http vs https as different resources', () => {
    expect(n('http://example.com')).not.toBe(n('https://example.com'));
  });

  it('handles repeated params with varied case in host', () => {
    expect(n('HTTP://EXAMPLE.com?A=1&a=2')).toBe('http://example.com/?A=1&a=2');
  });

  it('keeps query param order stable when keys/values identical', () => {
    expect(n('https://example.com?x=1&x=1')).toBe('https://example.com/?x=1&x=1');
  });

  it('handles Unicode path segments (percent-encoded in URL serialization)', () => {
    expect(n('https://example.com/路徑/資料')).toBe('https://example.com/%E8%B7%AF%E5%BE%91/%E8%B3%87%E6%96%99');
  });

  it('handles spaces and encodings equivalently', () => {
    expect(n('https://example.com/a%20b')).toBe('https://example.com/a%20b');
  });

  it('returns input for unparseable url-like strings', () => {
    expect(n('not a url')).toBe('not a url');
  });
});

describe('isDuplicate', () => {
  it('returns true for equivalent URLs after normalization', () => {
    expect(isDuplicate('https://example.com?a=1&utm_source=x', 'https://EXAMPLE.com/?a=1')).toBe(true);
  });

  it('returns false for different resources', () => {
    expect(isDuplicate('https://example.com/a', 'https://example.com/b')).toBe(false);
  });
});
