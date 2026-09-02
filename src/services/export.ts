/**
 * Export/Import service — handles data serialization for backup/restore.
 */

import { STORAGE_KEYS, storage } from './storage';

/** Shape of the exported data */
export interface ExportedData {
  version: string;
  exportedAt: number;
  settings: unknown;
  workspaces: unknown;
  saved: unknown;
  notes: unknown;
  quicklinks: unknown;
  tabGroups: unknown;
}

const VERSION = '1.0.0';

/** Export all NOVA data */
export async function exportAllData(): Promise<ExportedData> {
  const [settings, workspaces, saved, notes, quicklinks, tabGroups] = await Promise.all([
    storage.get(STORAGE_KEYS.settings),
    storage.get(STORAGE_KEYS.workspaces),
    storage.get(STORAGE_KEYS.saved),
    storage.get(STORAGE_KEYS.notes),
    storage.get(STORAGE_KEYS.quicklinks),
    storage.get(STORAGE_KEYS.tabGroups),
  ]);

  return {
    version: VERSION,
    exportedAt: Date.now(),
    settings,
    workspaces,
    saved,
    notes,
    quicklinks,
    tabGroups,
  };
}

/** Import data from an exported JSON */
export async function importAllData(data: ExportedData): Promise<void> {
  if (!data.version) {
    throw new Error('Invalid data format — missing version');
  }

  const operations: Promise<unknown>[] = [];

  if (data.settings) {
    operations.push(storage.set(STORAGE_KEYS.settings, data.settings));
  }
  if (data.workspaces) {
    operations.push(storage.set(STORAGE_KEYS.workspaces, data.workspaces));
  }
  if (data.saved) {
    operations.push(storage.set(STORAGE_KEYS.saved, data.saved));
  }
  if (data.notes) {
    operations.push(storage.set(STORAGE_KEYS.notes, data.notes));
  }
  if (data.quicklinks) {
    operations.push(storage.set(STORAGE_KEYS.quicklinks, data.quicklinks));
  }
  if (data.tabGroups) {
    operations.push(storage.set(STORAGE_KEYS.tabGroups, data.tabGroups));
  }

  await Promise.all(operations);
}

/** Clear all NOVA data from storage */
export async function clearAllData(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  await chrome.storage.local.remove(keys);

  // Also clear meta
  await chrome.storage.local.remove('nova_meta');
  await chrome.storage.local.remove('nova_focus_mode');
}
