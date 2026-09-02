/**
 * Universal search service.
 *
 * Combines results from:
 *   - Open tabs
 *   - Bookmarks
 *   - History
 *   - Saved pages
 *   - Workspaces
 *
 * Returns ranked, grouped results similar to Spotlight/Raycast.
 */

import type { HistoryEntry } from '@/types/history';
import type { SavedPage } from '@/types/saved';
import type { Workspace, SavedTab } from '@/types/workspace';
import type { BookmarkNode } from './bookmarks';
import { getAllTabs, searchOpenTabs } from './tabs';
import { searchBookmarks } from './bookmarks';
import { searchHistory } from './history';
import { searchSavedPages } from './saved';
import { loadWorkspaces } from './workspaces';

/** A single search result */
export interface SearchResult {
  id: string;
  type: 'tab' | 'bookmark' | 'history' | 'saved' | 'workspace' | 'quicklink';
  title: string;
  subtitle?: string;
  url?: string;
  favicon?: string;
  data: unknown;
}

/** Grouped search results */
export interface SearchResults {
  query: string;
  results: SearchResult[];
  groups: Record<string, SearchResult[]>;
  total: number;
  isNavigation: boolean;
}

/** The type of "navigation" intent (user is typing a URL or query) */
interface NavigationDetection {
  intent: 'url' | 'search' | 'shortcut';
  url?: string;
  query: string;
  engine: 'google' | 'duckduckgo' | 'bing' | 'brave';
}

/** Detect if the query is a URL, search, or shortcut */
export function detectIntent(query: string, engine: 'google' | 'duckduckgo' | 'bing' | 'brave' = 'google'): NavigationDetection {
  const trimmed = query.trim();

  // Check if it's a URL
  if (trimmed.includes('.') && !trimmed.startsWith('http')) {
    return { intent: 'url', url: `https://${trimmed}`, query: trimmed, engine };
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { intent: 'url', url: trimmed, query: trimmed, engine };
  }

  // Check for search shortcut (e.g., "g query" for Google, "y query" for YouTube)
  const shortcut = detectSearchShortcut(trimmed);
  if (shortcut) {
    return { intent: 'shortcut', ...shortcut, query: trimmed, engine };
  }

  // Default: treat as search
  return { intent: 'search', query: trimmed, engine };
}

/** Detect search shortcuts like "g query", "y query", "gh repo", etc. */
function detectSearchShortcut(query: string): { url: string; query: string } | null {
  const trimmed = query.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;

  const [shortcut, ...rest] = parts;
  const searchTerm = rest.join(' ');
  const encoded = encodeURIComponent(searchTerm);

  const shortcuts: Record<string, string> = {
    g: `https://google.com/search?q=${encoded}`,
    gg: `https://google.com/search?q=${encoded}`,
    y: `https://youtube.com/results?search_query=${encoded}`,
    yt: `https://youtube.com/results?search_query=${encoded}`,
    gh: `https://github.com/search?q=${encoded}`,
    google: `https://google.com/search?q=${encoded}`,
    youtube: `https://youtube.com/results?search_query=${encoded}`,
    github: `https://github.com/search?q=${encoded}`,
    wiki: `https://en.wikipedia.org/wiki/${encoded}`,
    amazon: `https://amazon.com/s?k=${encoded}`,
    reddit: `https://reddit.com/search?q=${encoded}`,
  };

  const url = shortcuts[shortcut.toLowerCase()];
  if (url) {
    return { url, query: searchTerm };
  }
  return null;
}

/** Run a universal search across all sources */
export async function universalSearch(query: string): Promise<SearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { query, results: [], groups: {}, total: 0, isNavigation: false };

  const [intent] = [detectIntent(query)];

  // Launch all searches in parallel
  const [
    tabResults,
    bookmarkResults,
    historyResults,
    savedResults,
    workspaceResults,
  ] = await Promise.all([
    searchOpenTabs(q),
    searchBookmarks(q),
    searchHistory(q, 20),
    searchSavedPages(q),
    searchWorkspaces(q),
  ]);

  // Convert to SearchResult format
  const tabs: SearchResult[] = tabResults.map(t => ({
    id: `tab-${t.id}`,
    type: 'tab',
    title: t.title ?? '',
    subtitle: t.url ?? '',
    url: t.url,
    favicon: t.favIconUrl,
    data: t,
  }));

  const bookmarks: SearchResult[] = bookmarkResults.map(b => ({
    id: `bookmark-${b.id}`,
    type: 'bookmark',
    title: b.title,
    subtitle: b.url,
    url: b.url,
    data: b,
  }));

  const history: SearchResult[] = historyResults.map(h => ({
    id: `history-${h.url}`,
    type: 'history',
    title: h.title || h.url,
    subtitle: formatRelativeTime(h.lastVisitTime),
    url: h.url,
    data: h,
  }));

  const saved: SearchResult[] = savedResults.map(s => ({
    id: `saved-${s.id}`,
    type: 'saved',
    title: s.title,
    subtitle: s.url,
    url: s.url,
    favicon: s.favicon,
    data: s,
  }));

  const workspaces: SearchResult[] = workspaceResults.map(w => ({
    id: `workspace-${w.id}`,
    type: 'workspace',
    title: w.name,
    subtitle: w.description ?? `${w.savedTabs.length} tabs`,
    data: w,
  }));

  const allResults = [...tabs, ...bookmarks, ...history, ...saved, ...workspaces];

  // Group by type
  const groups: Record<string, SearchResult[]> = {};
  if (tabs.length) groups['Open Tabs'] = tabs;
  if (bookmarks.length) groups['Bookmarks'] = bookmarks;
  if (history.length) groups['History'] = history;
  if (saved.length) groups['Saved Pages'] = saved;
  if (workspaces.length) groups['Workspaces'] = workspaces;

  return {
    query,
    results: allResults,
    groups,
    total: allResults.length,
    isNavigation: intent.intent !== 'search',
  };
}

/** Search workspaces by name/description */
async function searchWorkspaces(query: string): Promise<Workspace[]> {
  const workspaces = await loadWorkspaces();
  const q = query.toLowerCase();
  return workspaces.filter(w => {
    if (w.name.toLowerCase().includes(q)) return true;
    if (w.description && w.description.toLowerCase().includes(q)) return true;
    if (w.savedTabs.some(t => t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q))) return true;
    return false;
  });
}

/** Format relative time (re-used in search) */
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/** Get quick links from storage (for search) */
export async function getQuickLinks(query: string): Promise<SearchResult[]> {
  const { defaultQuickLinks } = await import('./quicklinks');
  const links = await defaultQuickLinks();
  const q = query.toLowerCase();
  return links
    .filter(l => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
    .map(l => ({
      id: `quicklink-${l.id}`,
      type: 'quicklink' as const,
      title: l.name,
      subtitle: l.url,
      url: l.url,
      data: l,
    }));
}
