/**
 * Workspaces service — manages workspace CRUD and tab persistence.
 */

import type { Workspace, WorkspaceIcon } from '@/types/workspace';
import type { SavedTab } from '@/types/workspace';
import { STORAGE_KEYS, storage } from './storage';
import { uuid } from '@/utils/uuid';

/** In-memory cache */
let cachedWorkspaces: Workspace[] | null = null;

/** Listeners */
const listeners = new Set<(workspaces: Workspace[]) => void>();

export function onWorkspacesChange(cb: (workspaces: Workspace[]) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(workspaces: Workspace[]): void {
  listeners.forEach(cb => cb(workspaces));
}

/** System workspace icons */
export const WORKSPACE_ICONS: { id: WorkspaceIcon; name: string; emoji: string }[] = [
  { id: 'briefcase', name: 'Briefcase', emoji: '💼' },
  { id: 'code', name: 'Code', emoji: '💻' },
  { id: 'graduation-cap', name: 'Study', emoji: '🎓' },
  { id: 'book', name: 'Book', emoji: '📚' },
  { id: 'youtube', name: 'YouTube', emoji: '📺' },
  { id: 'globe', name: 'Globe', emoji: '🌐' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀' },
  { id: 'shield', name: 'Shield', emoji: '🛡️' },
  { id: 'star', name: 'Star', emoji: '⭐' },
  { id: 'heartbeat', name: 'Heart', emoji: '❤️' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨' },
  { id: 'folder', name: 'Folder', emoji: '📁' },
  { id: 'terminal', name: 'Terminal', emoji: '⌨️' },
  { id: 'mail', name: 'Mail', emoji: '✉️' },
  { id: 'clock', name: 'Clock', emoji: '⏰' },
  { id: 'database', name: 'Database', emoji: '🗄️' },
  { id: 'palette', name: 'Palette', emoji: '🎨' },
  { id: 'home', name: 'Home', emoji: '🏠' },
];

/** Default workspaces created on first install */
export function createDefaultWorkspaces(): Workspace[] {
  const now = Date.now();
  return [
    {
      id: uuid(),
      name: 'Work',
      description: 'GitHub, docs, and tools',
      icon: 'briefcase',
      accent: '220 80% 65%',
      savedTabs: [],
      activeTabIds: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: 'University',
      description: 'Research and applications',
      icon: 'graduation-cap',
      accent: '140 60% 50%',
      savedTabs: [],
      activeTabIds: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: 'Content',
      description: 'YouTube Studio and analytics',
      icon: 'youtube',
      accent: '0 80% 60%',
      savedTabs: [],
      activeTabIds: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: 'Personal',
      description: 'Reddit, YouTube, and leisure',
      icon: 'home',
      accent: '265 80% 65%',
      savedTabs: [],
      activeTabIds: [],
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/** Load workspaces from storage */
export async function loadWorkspaces(): Promise<Workspace[]> {
  if (cachedWorkspaces) return cachedWorkspaces;

  try {
    const stored = await storage.get<Workspace[]>(STORAGE_KEYS.workspaces);
    if (stored && stored.length > 0) {
      cachedWorkspaces = stored;
    } else {
      cachedWorkspaces = createDefaultWorkspaces();
      await saveWorkspaces(cachedWorkspaces);
    }
    return [...cachedWorkspaces];
  } catch {
    cachedWorkspaces = createDefaultWorkspaces();
    return [...cachedWorkspaces];
  }
}

/** Save workspaces to storage */
async function saveWorkspaces(workspaces: Workspace[]): Promise<void> {
  cachedWorkspaces = workspaces;
  notify(workspaces);
  try {
    await storage.set(STORAGE_KEYS.workspaces, workspaces);
  } catch (err) {
    console.warn('NOVA: Failed to persist workspaces', err);
  }
}

/** Get a single workspace by ID */
export async function getWorkspace(id: string): Promise<Workspace | null> {
  const workspaces = await loadWorkspaces();
  return workspaces.find(w => w.id === id) ?? null;
}

/** Create a new workspace */
export async function createWorkspace(input: {
  name: string;
  description?: string;
  icon?: WorkspaceIcon;
  accent?: string;
}): Promise<Workspace> {
  const workspaces = await loadWorkspaces();
  const now = Date.now();
  const workspace: Workspace = {
    id: uuid(),
    name: input.name,
    description: input.description,
    icon: input.icon ?? 'folder',
    accent: input.accent ?? '220 80% 65%',
    savedTabs: [],
    activeTabIds: [],
    createdAt: now,
    updatedAt: now,
  };
  workspaces.push(workspace);
  await saveWorkspaces(workspaces);
  return workspace;
}

/** Update a workspace */
export async function updateWorkspace(id: string, patch: Partial<Workspace>): Promise<Workspace | null> {
  const workspaces = await loadWorkspaces();
  const idx = workspaces.findIndex(w => w.id === id);
  if (idx === -1) return null;

  workspaces[idx] = {
    ...workspaces[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  await saveWorkspaces(workspaces);
  return workspaces[idx];
}

/** Delete a workspace (system workspaces cannot be deleted) */
export async function deleteWorkspace(id: string): Promise<boolean> {
  const workspaces = await loadWorkspaces();
  const workspace = workspaces.find(w => w.id === id);
  if (!workspace) return false;
  if (workspace.isSystem) return false;

  const filtered = workspaces.filter(w => w.id !== id);
  await saveWorkspaces(filtered);
  return true;
}

/** Add a saved tab to a workspace */
export async function addSavedTab(workspaceId: string, tab: { url: string; title: string; favicon?: string }): Promise<SavedTab | null> {
  const workspaces = await loadWorkspaces();
  const idx = workspaces.findIndex(w => w.id === workspaceId);
  if (idx === -1) return null;

  const now = Date.now();
  const savedTab: SavedTab = {
    id: uuid(),
    url: tab.url,
    title: tab.title,
    favicon: tab.favicon,
    order: workspaces[idx].savedTabs.length,
    createdAt: now,
    updatedAt: now,
  };

  workspaces[idx].savedTabs.push(savedTab);
  workspaces[idx].updatedAt = now;
  await saveWorkspaces(workspaces);
  return savedTab;
}

/** Remove a saved tab from a workspace */
export async function removeSavedTab(workspaceId: string, tabId: string): Promise<boolean> {
  const workspaces = await loadWorkspaces();
  const wsIdx = workspaces.findIndex(w => w.id === workspaceId);
  if (wsIdx === -1) return false;

  const tabIdx = workspaces[wsIdx].savedTabs.findIndex(t => t.id === tabId);
  if (tabIdx === -1) return false;

  workspaces[wsIdx].savedTabs.splice(tabIdx, 1);
  // Reorder
  workspaces[wsIdx].savedTabs.forEach((t, i) => {
    t.order = i;
  });
  workspaces[wsIdx].updatedAt = Date.now();
  await saveWorkspaces(workspaces);
  return true;
}

/** Reorder saved tabs in a workspace */
export async function reorderSavedTabs(workspaceId: string, orderedIds: string[]): Promise<boolean> {
  const workspaces = await loadWorkspaces();
  const idx = workspaces.findIndex(w => w.id === workspaceId);
  if (idx === -1) return false;

  const sorted: SavedTab[] = [];
  for (const id of orderedIds) {
    const tab = workspaces[idx].savedTabs.find(t => t.id === id);
    if (tab) sorted.push(tab);
  }
  // Include any tabs not in the ordered list
  for (const tab of workspaces[idx].savedTabs) {
    if (!orderedIds.includes(tab.id)) {
      sorted.push(tab);
    }
  }
  sorted.forEach((t, i) => {
    t.order = i;
  });
  workspaces[idx].savedTabs = sorted;
  workspaces[idx].updatedAt = Date.now();
  await saveWorkspaces(workspaces);
  return true;
}

/** Get the default workspace (first non-system or the first one) */
export async function getDefaultWorkspace(): Promise<Workspace | null> {
  const workspaces = await loadWorkspaces();
  return workspaces.find(w => !w.isSystem) ?? workspaces[0] ?? null;
}
