/**
 * Application settings type definitions.
 */

import type { Theme } from './theme';

export type Density = 'compact' | 'normal' | 'comfortable';

export type SearchEngine = 'google' | 'duckduckgo' | 'bing' | 'brave' | 'custom';

export type SearchBehavior = 'search' | 'autocomplete' | 'both';

export type NewTabSettingKey =
  | 'showClock'
  | 'showGreeting'
  | 'showQuickLinks'
  | 'showRecentPages'
  | 'showSavedPages';

export interface NewTabSettings {
  showClock: boolean;
  showGreeting: boolean;
  showQuickLinks: boolean;
  showRecentPages: boolean;
  showSavedPages: boolean;
}

export interface Settings {
  // Appearance
  theme: Theme;
  accent: string;
  density: Density;
  animations: boolean;
  reducedMotion: boolean;

  // New Tab
  newTab: NewTabSettings;

  // Search
  defaultSearchEngine: SearchEngine;
  searchBehavior: SearchBehavior;

  // Workspaces
  defaultWorkspace: string | null;
  autoSwitchWorkspaces: boolean;

  // Keyboard
  keyboardShortcuts: Record<string, string>;

  // Focus
  focusMode: {
    autoDimInactive: boolean;
    hideDistractions: boolean;
  };
}
