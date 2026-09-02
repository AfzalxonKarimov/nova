import { useEffect, useState, useCallback } from 'react';
import {
  getAllTabs,
  getActiveTab,
  focusTab,
  closeTab,
  reloadTab,
  duplicateTab,
  searchOpenTabs,
  getRecentTabs,
  TabDomainGroup,
  getTabDomainGroups,
  RecentTab,
  tabToRecent,
} from '@/services/tabs';

export interface TabInfo {
  id: number;
  url: string;
  title: string;
  favIconUrl?: string;
  active: boolean;
  windowId: number;
  lastAccessed?: number;
  pinned?: boolean;
}

/** Convert chrome tab to our TabInfo */
function toTabInfo(tab: chrome.tabs.Tab): TabInfo {
  return {
    id: tab.id ?? 0,
    url: tab.url ?? '',
    title: tab.title ?? '',
    favIconUrl: tab.favIconUrl,
    active: tab.active ?? false,
    windowId: tab.windowId ?? 0,
    lastAccessed: tab.lastAccessed,
    pinned: tab.pinned,
  };
}

/** Hook: all open tabs */
export function useTabs() {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const allTabs = await getAllTabs();
    setTabs(allTabs.map(toTabInfo));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // Listen for tab updates
    if (chrome.tabs) {
      chrome.tabs.onUpdated.addListener(refresh);
      chrome.tabs.onRemoved.addListener(refresh);
      chrome.tabs.onCreated.addListener(refresh);
    }
    return () => {
      if (chrome.tabs) {
        chrome.tabs.onUpdated.removeListener(refresh);
        chrome.tabs.onRemoved.removeListener(refresh);
        chrome.tabs.onCreated.removeListener(refresh);
      }
    };
  }, [refresh]);

  return { tabs, loading, refresh };
}

/** Hook: active tab */
export function useActiveTab() {
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const active = await getActiveTab();
    setTab(active ? toTabInfo(active) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (chrome.tabs) {
      chrome.tabs.onUpdated.addListener(refresh);
      chrome.tabs.onActivated.addListener(refresh);
    }
    return () => {
      if (chrome.tabs) {
        chrome.tabs.onUpdated.removeListener(refresh);
        chrome.tabs.onActivated.removeListener(refresh);
      }
    };
  }, [refresh]);

  return { tab, loading, refresh };
}

/** Hook: tab operations */
export function useTabOperations() {
  return {
    focus: focusTab,
    close: closeTab,
    reload: reloadTab,
    duplicate: duplicateTab,
  };
}

/** Hook: recent tabs */
export function useRecentTabs(limit: number = 10) {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [recent, setRecent] = useState<RecentTab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRecentTabs(limit).then(r => {
      if (mounted) {
        setRecent(r);
        setLoading(false);
      }
    });
  }, [limit]);

  return { recent, loading };
}

/** Hook: tab domain groups */
export function useTabGroups() {
  const [groups, setGroups] = useState<TabDomainGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getTabDomainGroups().then(g => {
      if (mounted) {
        setGroups(g);
        setLoading(false);
      }
    });
  }, []);

  return { groups, loading };
}

/** Hook: search open tabs */
export function useTabSearch() {
  const [results, setResults] = useState<TabInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const found = await searchOpenTabs(query);
    setResults(found.map(toTabInfo));
    setLoading(false);
  }, []);

  return { results, loading, search };
}
