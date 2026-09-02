/**
 * Quick Links service — manages user-defined quick links.
 * Provides defaults for the New Tab page and search.
 */

import type { QuickLink } from '@/types/quicklink';
import { STORAGE_KEYS, storage } from './storage';
import { uuid } from '@/utils/uuid';

/** Default quick links — shown on first launch */
export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: uuid(), name: 'GitHub', url: 'https://github.com', icon: '🐙', order: 0, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'YouTube', url: 'https://youtube.com', icon: '📺', order: 1, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'Gmail', url: 'https://gmail.com', icon: '✉️', order: 2, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'Drive', url: 'https://drive.google.com', icon: '📁', order: 3, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'Google', url: 'https://google.com', icon: '🔍', order: 4, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'Calendar', url: 'https://calendar.google.com', icon: '📅', order: 5, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖', order: 6, createdAt: 0, updatedAt: 0 },
  { id: uuid(), name: 'Docs', url: 'https://docs.google.com', icon: '📝', order: 7, createdAt: 0, updatedAt: 0 },
];

/** In-memory cache */
let cachedLinks: QuickLink[] | null = null;

/** Listeners */
const listeners = new Set<(links: QuickLink[]) => void>();

export function onQuickLinksChange(cb: (links: QuickLink[]) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(links: QuickLink[]): void {
  listeners.forEach(cb => cb(links));
}

/** Load quick links (defaults if none stored) */
export async function defaultQuickLinks(): Promise<QuickLink[]> {
  if (cachedLinks) return cachedLinks;

  try {
    const stored = await storage.get<QuickLink[]>(STORAGE_KEYS.quicklinks);
    if (stored && stored.length > 0) {
      cachedLinks = stored;
    } else {
      cachedLinks = DEFAULT_QUICK_LINKS.map(l => ({ ...l, createdAt: Date.now(), updatedAt: Date.now() }));
      await storage.set(STORAGE_KEYS.quicklinks, cachedLinks);
    }
    return [...cachedLinks];
  } catch {
    cachedLinks = DEFAULT_QUICK_LINKS.map(l => ({ ...l, createdAt: Date.now(), updatedAt: Date.now() }));
    return [...cachedLinks];
  }
}

/** Save quick links */
async function persist(links: QuickLink[]): Promise<void> {
  cachedLinks = links;
  notify(links);
  try {
    await storage.set(STORAGE_KEYS.quicklinks, links);
  } catch (err) {
    console.warn('NOVA: Failed to persist quick links', err);
  }
}

/** Create a quick link */
export async function createQuickLink(input: { name: string; url: string; icon?: string }): Promise<QuickLink> {
  const links = await defaultQuickLinks();
  const now = Date.now();
  const link: QuickLink = {
    id: uuid(),
    name: input.name,
    url: input.url,
    icon: input.icon,
    order: links.length,
    createdAt: now,
    updatedAt: now,
  };
  links.push(link);
  await persist(links);
  return link;
}

/** Delete a quick link */
export async function deleteQuickLink(id: string): Promise<boolean> {
  const links = await defaultQuickLinks();
  const filtered = links.filter(l => l.id !== id);
  if (filtered.length === links.length) return false;
  await persist(filtered);
  return true;
}

/** Reorder quick links */
export async function reorderQuickLinks(orderedIds: string[]): Promise<boolean> {
  const links = await defaultQuickLinks();
  const sorted: QuickLink[] = [];
  for (const id of orderedIds) {
    const link = links.find(l => l.id === id);
    if (link) sorted.push(link);
  }
  for (const link of links) {
    if (!orderedIds.includes(link.id)) sorted.push(link);
  }
  sorted.forEach((l, i) => {
    l.order = i;
  });
  await persist(sorted);
  return true;
}
