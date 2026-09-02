/**
 * Tabs service — wraps chrome.tabs API with typed, error-safe helpers.
 */

import type { RecentTab } from './storage';
export type { RecentTab } from './storage';

/** Get all open tabs across all windows */
export async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  try {
    return await chrome.tabs.query({});
  } catch (err) {
    console.warn('NOVA: Failed to query tabs', err);
    return [];
  }
}

/** Get the active tab in the current window */
export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] ?? null;
  } catch {
    return null;
  }
}

/** Switch to a tab (activate it) */
export async function focusTab(tabId: number): Promise<void> {
  try {
    await chrome.tabs.update(tabId, { active: true });
    // Focus the window containing the tab
    const tab = await chrome.tabs.get(tabId);
    if (tab?.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  } catch (err) {
    console.warn('NOVA: Failed to focus tab', err);
  }
}

/** Close a tab */
export async function closeTab(tabId: number): Promise<void> {
  try {
    await chrome.tabs.remove(tabId);
  } catch (err) {
    console.warn('NOVA: Failed to close tab', err);
  }
}

/** Reload a tab */
export async function reloadTab(tabId: number): Promise<void> {
  try {
    await chrome.tabs.reload(tabId);
  } catch (err) {
    console.warn('NOVA: Failed to reload tab', err);
  }
}

/** Duplicate a tab */
export async function duplicateTab(tabId: number): Promise<chrome.tabs.Tab | null> {
  try {
    const tab = await chrome.tabs.duplicate(tabId);
    return tab ?? null;
  } catch {
    return null;
  }
}

/** Get recently accessed tabs from chrome.sessions */
export async function getRecentlyClosedTabs(): Promise<chrome.sessions.Session[]> {
  try {
    const sessions = await chrome.sessions.getRecentlyClosed();
    return sessions.filter(s => s.tab).slice(0, 10);
  } catch {
    return [];
  }
}

/** Reopen a closed tab from sessions data */
export async function reopenClosedTab(session: chrome.sessions.Session): Promise<void> {
  try {
    if (session.tab?.url) {
      await chrome.tabs.create({
        url: session.tab.url,
        active: true,
      });
    } else if (session.window) {
      await chrome.windows.create({ url: session.window.tabs?.[0]?.url });
    }
  } catch (err) {
    console.warn('NOVA: Failed to reopen tab', err);
  }
}

/** Search open tabs by URL or title */
export async function searchOpenTabs(query: string): Promise<chrome.tabs.Tab[]> {
  if (!query.trim()) return [];
  const tabs = await getAllTabs();
  const q = query.toLowerCase();
  return tabs.filter(t => (t.title?.toLowerCase().includes(q) ?? false) || t.url?.toLowerCase().includes(q));
}

/** Build a RecentTab from a chrome tab */
export function tabToRecent(tab: chrome.tabs.Tab): RecentTab {
  return {
    url: tab.url ?? '',
    title: tab.title ?? '',
    favicon: tab.favIconUrl ?? undefined,
    lastAccessed: tab.lastAccessed ?? Date.now(),
  };
}

/** Get recent tabs from history (limited) */
export async function getRecentTabs(limit: number = 10): Promise<RecentTab[]> {
  try {
    // Use chrome.history to get recently visited
    const results = await chrome.history.search({
      text: '',
      startTime: 0,
      maxResults: limit,
    });
    return results.map(r => ({
      url: r.url ?? '',
      title: r.title ?? '',
      favicon: undefined,
      lastAccessed: r.lastVisitTime ?? 0,
    }));
  } catch (err) {
    // Fallback: use currently open tabs
    const tabs = await getAllTabs();
    return tabs
      .map(tabToRecent)
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit);
  }
}

/** Group tabs by domain for the workspace tab management view */
export interface TabDomainGroup {
  domain: string;
  title: string;
  count: number;
  favicon?: string;
  tabIds: number[];
}

export async function getTabDomainGroups(): Promise<TabDomainGroup[]> {
  const tabs = await getAllTabs();
  const groups = new Map<string, TabDomainGroup>();

  for (const tab of tabs) {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) continue;
    try {
      const parsed = new URL(tab.url);
      const domain = parsed.hostname;
      const existing = groups.get(domain);
      if (existing) {
        existing.count++;
        existing.tabIds.push(tab.id!);
    } else {
      groups.set(domain, {
        domain,
        title: parsed.hostname,
        count: 1,
        favicon: tab.favIconUrl,
        tabIds: [tab.id!],
      });
    }
    } catch {
      // Skip invalid URLs
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.count - a.count);
}

/** Create a tab group in Chrome */
export async function createTabGroup(tabs: number[], name: string, color: string): Promise<number | null> {
  try {
    const groupId = await chrome.tabs.group({ tabIds: tabs });
    await chrome.tabGroups.update(groupId, { title: name, color: color as chrome.tabGroups.ColorEnum });
    return groupId;
  } catch (err) {
    console.warn('NOVA: Failed to create tab group', err);
    return null;
  }
}

/** Ungroup tabs */
export async function ungroupTabs(tabIds: number[]): Promise<void> {
  try {
    await chrome.tabs.ungroup(tabIds);
  } catch (err) {
    console.warn('NOVA: Failed to ungroup tabs', err);
  }
}
