/**
 * Saved Pages service — manage pages saved for later return.
 * Independent of workspaces (but can be tagged with a workspaceId).
 */

import type { SavedPage } from '@/types/saved';
import type { UUID } from '@/types/utils';
import { STORAGE_KEYS, storage } from './storage';
import { uuid } from '@/utils/uuid';

/** In-memory cache */
let cachedSaved: SavedPage[] | null = null;

/** Listeners */
const listeners = new Set<(pages: SavedPage[]) => void>();

export function onSavedChange(cb: (pages: SavedPage[]) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(pages: SavedPage[]): void {
  listeners.forEach(cb => cb(pages));
}

/** Load saved pages from storage */
export async function loadSavedPages(): Promise<SavedPage[]> {
  if (cachedSaved) return cachedSaved;

  try {
    const stored = await storage.get<SavedPage[]>(STORAGE_KEYS.saved);
    cachedSaved = stored ?? [];
    return [...cachedSaved];
  } catch {
    cachedSaved = [];
    return [];
  }
}

/** Save saved pages to storage */
async function persist(pages: SavedPage[]): Promise<void> {
  cachedSaved = pages;
  notify(pages);
  try {
    await storage.set(STORAGE_KEYS.saved, pages);
  } catch (err) {
    console.warn('NOVA: Failed to persist saved pages', err);
  }
}

/** Save the current active tab as a saved page */
export async function saveCurrentPage(input: {
  url?: string;
  title?: string;
  favicon?: string;
  workspaceId?: string | null;
  note?: string;
  tags?: string[];
}): Promise<SavedPage | null> {
  if (!input.url) return null;

  const now = Date.now();
  const savedPage: SavedPage = {
    id: uuid(),
    url: input.url,
    title: input.title ?? input.url,
    favicon: input.favicon ?? undefined,
    workspaceId: (input.workspaceId as UUID | null) ?? null,
    note: input.note,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };

  const pages = await loadSavedPages();

  // De-duplicate by URL — update existing entry
  const existingIdx = pages.findIndex(p => p.url === savedPage.url);
  if (existingIdx !== -1) {
    pages[existingIdx] = {
      ...pages[existingIdx],
      title: savedPage.title,
      favicon: savedPage.favicon,
      workspaceId: savedPage.workspaceId ?? pages[existingIdx].workspaceId,
      note: savedPage.note ?? pages[existingIdx].note,
      tags: savedPage.tags ?? pages[existingIdx].tags,
      updatedAt: now,
    };
  } else {
    pages.unshift(savedPage);
  }

  await persist(pages);
  return existingIdx !== -1 ? pages[existingIdx] : savedPage;
}

/** Delete a saved page */
export async function deleteSavedPage(id: string): Promise<boolean> {
  const pages = await loadSavedPages();
  const filtered = pages.filter(p => p.id !== id);
  if (filtered.length === pages.length) return false;
  await persist(filtered);
  return true;
}

/** Update a saved page's note or tags */
export async function updateSavedPage(id: string, patch: Partial<Pick<SavedPage, 'note' | 'tags' | 'title' | 'workspaceId'>>): Promise<SavedPage | null> {
  const pages = await loadSavedPages();
  const idx = pages.findIndex(p => p.id === id);
  if (idx === -1) return null;

  pages[idx] = {
    ...pages[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  await persist(pages);
  return pages[idx];
}

/** Search saved pages by query */
export async function searchSavedPages(query: string): Promise<SavedPage[]> {
  const pages = await loadSavedPages();
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  return pages.filter(p => p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q));
}

/** Get saved pages for a specific workspace */
export async function getSavedPagesByWorkspace(workspaceId: string | null): Promise<SavedPage[]> {
  const pages = await loadSavedPages();
  return pages.filter(p => p.workspaceId === workspaceId);
}
