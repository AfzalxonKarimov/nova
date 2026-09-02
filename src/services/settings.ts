/**
 * Settings service — manages application-wide settings using chrome.storage.local.
 */

import type { Settings } from '@/types/settings';
import { STORAGE_KEYS, storage, StorageError } from './storage';

/** Default settings — used on first install and as fallback */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accent: '220 80% 65%',
  density: 'normal',
  animations: true,
  reducedMotion: false,
  newTab: {
    showClock: true,
    showGreeting: true,
    showQuickLinks: true,
    showRecentPages: true,
    showSavedPages: true,
  },
  defaultSearchEngine: 'google',
  searchBehavior: 'autocomplete',
  defaultWorkspace: null,
  autoSwitchWorkspaces: false,
  keyboardShortcuts: {},
  focusMode: {
    autoDimInactive: false,
    hideDistractions: true,
  },
};

/** Default accent colors — premium palette */
export const ACCENT_COLORS: { name: string; value: string }[] = [
  { name: 'Blue', value: '220 80% 65%' },
  { name: 'Indigo', value: '240 80% 65%' },
  { name: 'Violet', value: '265 80% 65%' },
  { name: 'Rose', value: '330 80% 65%' },
  { name: 'Green', value: '140 60% 50%' },
  { name: 'Teal', value: '180 70% 50%' },
  { name: 'Amber', value: '35 90% 55%' },
  { name: 'Red', value: '0 80% 60%' },
];

/** In-memory cache so we don't hammer chrome.storage */
let cachedSettings: Settings | null = null;

/** Event listeners for settings changes */
const listeners = new Set<(settings: Settings) => void>();

/** Subscribe to settings changes */
export function onSettingsChange(cb: (settings: Settings) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Notify all listeners */
function notify(settings: Settings): void {
  listeners.forEach(cb => cb(settings));
}

/** Load settings from storage, with caching */
export async function loadSettings(): Promise<Settings> {
  if (cachedSettings) return { ...cachedSettings };

  try {
    const stored = await storage.get<Settings>(STORAGE_KEYS.settings);
    cachedSettings = { ...DEFAULT_SETTINGS, ...stored };
    return { ...cachedSettings };
  } catch (err) {
    // Fall back to defaults on any error
    cachedSettings = { ...DEFAULT_SETTINGS };
    return { ...cachedSettings };
  }
}

/** Save settings to storage and notify listeners */
export async function saveSettings(settings: Settings): Promise<void> {
  cachedSettings = { ...settings };
  notify(settings);
  try {
    await storage.set(STORAGE_KEYS.settings, settings);
  } catch (err) {
    // Don't throw — we've already updated in-memory state
    console.warn('NOVA: Failed to persist settings', err);
  }
}

/** Update specific settings keys */
export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const updated = { ...current, ...patch };
  await saveSettings(updated);
  return updated;
}

/** Update nested settings (e.g., newTab.showClock) */
export async function updateNestedSetting<K extends keyof Settings, P extends keyof Settings[K]>(
  parent: K,
  key: P,
  value: Settings[K][P],
): Promise<Settings> {
  const current = await loadSettings();
  const parentObj = current[parent] as Record<string, unknown>;
  parentObj[key as string] = value as unknown;
  const updated = { ...current, [parent]: parentObj };
  await saveSettings(updated);
  return updated;
}

/** Reset settings to defaults */
export async function resetSettings(): Promise<Settings> {
  cachedSettings = { ...DEFAULT_SETTINGS };
  notify(cachedSettings);
  try {
    await storage.set(STORAGE_KEYS.settings, cachedSettings);
  } catch {
    // ignore
  }
  return { ...cachedSettings };
}

/** Apply the theme to the document element */
export function applyTheme(theme: string, accent?: string): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (accent) {
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-hover', accent.replace(/% 65/, '% 70'));
    root.style.setProperty('--accent-active', accent.replace(/% 65/, '% 60'));
  }
}

/** Apply density to document element */
export function applyDensity(density: string): void {
  const root = document.documentElement;
  root.setAttribute('data-density', density);
}

/** Initialize settings on app load — applies theme, density, etc. */
export async function initializeSettings(): Promise<Settings> {
  const settings = await loadSettings();
  applyTheme(settings.theme, settings.accent);
  applyDensity(settings.density);
  if (settings.reducedMotion) {
    document.documentElement.setAttribute('data-reduce-motion', 'true');
  }
  return settings;
}
