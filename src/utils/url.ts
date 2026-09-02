/**
 * URL utility functions.
 */

import type { SearchEngine } from '@/types/settings';

/** Safely parse a URL, returning null on failure. */
export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/** Check if a string is a valid URL */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Extract the hostname from a URL */
export function getHostname(url: string): string {
  const parsed = parseUrl(url);
  return parsed ? parsed.hostname : url;
}

/** Get the favicon for a URL. Tries Google's service as fallback. */
export function getFavicon(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  // Chrome's built-in favicon service
  return `chrome-extension://placeholder/_generated_icons/32.png?${parsed.hostname}`;
}

/** Get a Google-style favicon URL as fallback */
export function getGoogleFavicon(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
}

/** Sanitize a URL — ensure it has a protocol */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/** Build a search URL using the given query and engine */
export function buildSearchUrl(query: string, engine: SearchEngine): string {
  const encoded = encodeURIComponent(query);
  switch (engine) {
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${encoded}`;
    case 'bing':
      return `https://www.bing.com/search?q=${encoded}`;
    case 'brave':
      return `https://search.brave.com/search?q=${encoded}`;
    case 'google':
    default:
      return `https://www.google.com/search?q=${encoded}`;
  }
}

/** Intent detection result */
export interface IntentResult {
  intent: 'url' | 'search';
  url?: string;
  query?: string;
}

/**
 * Detect whether a query string is a URL or a search term.
 * If it looks like a URL (has a TLD or starts with http), it's a URL.
 * Otherwise it's a search query.
 */
export function detectIntent(query: string): IntentResult {
  const trimmed = query.trim();
  if (!trimmed) return { intent: 'search', query: trimmed };

  // If it starts with http:// or https://, it's a URL
  if (/^https?:\/\//i.test(trimmed)) {
    return { intent: 'url', url: trimmed };
  }

  // If it has no spaces and looks like a domain (contains a dot with a TLD)
  if (!trimmed.includes(' ') && isValidUrl(`https://${trimmed}`)) {
    return { intent: 'url', url: `https://${trimmed}` };
  }

  return { intent: 'search', query: trimmed };
}
