/**
 * History service — wraps chrome.history API (requires history permission).
 */

import type { HistoryEntry } from '@/types/history';

/** Maximum number of recent history items to fetch */
const MAX_HISTORY_ITEMS = 200;

/** Get recently visited pages */
export async function getRecentHistory(limit: number = 50): Promise<HistoryEntry[]> {
  try {
    if (!chrome.history) {
      return [];
    }
    const results = await chrome.history.search({
      text: '',
      startTime: 0,
      maxResults: limit,
    });
    return results.map(r => ({
      url: r.url ?? '',
      title: r.title ?? '',
      lastVisitTime: r.lastVisitTime ?? 0,
      favicons: [],
    }));
  } catch (err) {
    console.warn('NOVA: Failed to read history', err);
    return [];
  }
}

/** Search history */
export async function searchHistory(query: string, limit: number = 20): Promise<HistoryEntry[]> {
  if (!query.trim()) return [];
  try {
    if (!chrome.history) return [];
    const results = await chrome.history.search({
      text: query,
      startTime: 0,
      maxResults: limit,
    });
    return results.map(r => ({
      url: r.url ?? '',
      title: r.title ?? '',
      lastVisitTime: r.lastVisitTime ?? 0,
      favicons: [],
    }));
  } catch (err) {
    console.warn('NOVA: Failed to search history', err);
    return [];
  }
}

/** Delete a history entry */
export async function deleteHistoryEntry(url: string): Promise<void> {
  try {
    if (chrome.history) {
      await chrome.history.deleteUrl({ url });
    }
  } catch (err) {
    console.warn('NOVA: Failed to delete history entry', err);
  }
}

/** Delete all history */
export async function deleteAllHistory(): Promise<void> {
  try {
    if (chrome.history) {
      await chrome.history.deleteAll();
    }
  } catch (err) {
    console.warn('NOVA: Failed to clear history', err);
  }
}
