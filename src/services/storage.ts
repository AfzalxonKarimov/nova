/**
 * Chrome Storage Service
 *
 * A typed wrapper around chrome.storage.local with error handling.
 * Provides a clean async API for reading/writing structured data.
 *
 * Storage schema:
 *   'nova_settings'   -> Settings
 *   'nova_workspaces' -> Workspace[]
 *   'nova_saved'      -> SavedPage[]
 *   'nova_notes'      -> Note[]
 *   'nova_quicklinks' -> QuickLink[]
 *   'nova_tab_groups' -> TabGroup[]
 *   'nova_recent'     -> RecentTab[]
 *   'nova_meta'       -> MetaInfo
 */

import type { Settings } from '@/types/settings';
import type { Workspace } from '@/types/workspace';
import type { SavedPage } from '@/types/saved';
import type { Note } from '@/types/note';
import type { QuickLink } from '@/types/quicklink';
import type { TabGroup } from '@/types/tab-group';

/** Storage keys used by NOVA */
export const STORAGE_KEYS = {
  settings: 'nova_settings',
  workspaces: 'nova_workspaces',
  saved: 'nova_saved',
  notes: 'nova_notes',
  quicklinks: 'nova_quicklinks',
  tabGroups: 'nova_tab_groups',
  recent: 'nova_recent',
  meta: 'nova_meta',
} as const;

/** Shape of a recent tab entry (for "continue where you left off") */
export interface RecentTab {
  url: string;
  title: string;
  favicon?: string;
  lastAccessed: number;
}

/** Meta info — tracks installed version, last opened, etc. */
export interface MetaInfo {
  installedAt: number;
  lastOpenedAt: number;
  version: string;
  seenWelcome: boolean;
}

/** Storage error wrapper */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/** Result of a storage operation */
export type StorageResult<T> =
  | { ok: true; data: T | undefined }
  | { ok: false; error: StorageError };

const isChromeStorage = (): boolean =>
  typeof chrome !== 'undefined' && chrome.storage?.local !== undefined;

/** Convert a chrome.storage area to a Promise-based get/set */
class ChromeStorageArea {
  readonly area = chrome.storage.local;

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await this.area.get(key);
      return result[key] as T | undefined;
    } catch (err) {
      throw new StorageError(`Failed to read "${key}"`, key, err);
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.area.set({ [key]: value });
    } catch (err) {
      throw new StorageError(`Failed to write "${key}"`, key, err);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.area.remove(key);
    } catch (err) {
      throw new StorageError(`Failed to remove "${key}"`, key, err);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.area.clear();
    } catch (err) {
      throw new StorageError('Failed to clear storage', undefined, err);
    }
  }

  async getAll<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    try {
      const result = await this.area.get(keys);
      return result as Partial<T>;
    } catch (err) {
      throw new StorageError('Failed to read multiple keys', undefined, err);
    }
  }
}

// Singleton storage area
const storageArea = isChromeStorage() ? new ChromeStorageArea() : null;

/** Get the storage area (throws if chrome.storage not available) */
function getStorage(): ChromeStorageArea {
  if (!storageArea) {
    throw new StorageError('chrome.storage is not available in this context');
  }
  return storageArea;
}

/** Wrapper that returns a result instead of throwing */
export async function safeGet<T>(key: string): Promise<StorageResult<T>> {
  try {
    const data = await getStorage().get<T>(key);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof StorageError ? err : new StorageError(String(err)) };
  }
}

export async function safeSet<T>(key: string, value: T): Promise<StorageResult<void>> {
  try {
    await getStorage().set(key, value);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof StorageError ? err : new StorageError(String(err)) };
  }
}

// ——— Convenience typed accessors ———

export const storage = {
  /** Read a single key */
  async get<T>(key: string): Promise<T | undefined> {
    return getStorage().get<T>(key);
  },

  /** Write a single key */
  async set<T>(key: string, value: T): Promise<void> {
    await getStorage().set(key, value);
  },

  /** Remove a key */
  async remove(key: string): Promise<void> {
    await getStorage().remove(key);
  },

  /** Read multiple keys at once */
  async getMultiple<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    return getStorage().getAll<T>(keys);
  },

  /** Listen for storage changes */
  onChange(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
    if (!isChromeStorage()) return;
    chrome.storage.onChanged.addListener(callback);
  },
};
