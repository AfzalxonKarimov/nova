/**
 * Workspace domain type.
 * A workspace is a named collection of saved tabs/URLs that the user
 * can switch between to maintain different contexts (Work, University,
 * Content creation, Personal, etc.).
 */

import type { UUID, Timestamp } from './utils';

/** Built-in workspace icons — simple, mnemonic */
export type WorkspaceIcon =
  | 'briefcase'
  | 'graduation-cap'
  | 'youtube'
  | 'home'
  | 'code'
  | 'book'
  | 'heart'
  | 'star'
  | 'sparkles'
  | 'folder'
  | 'rocket'
  | 'globe'
  | 'shield'
  | 'palette'
  | 'database'
  | 'terminal'
  | 'mail'
  | 'clock'
  | 'heartbeat';

export interface Workspace {
  /** Unique identifier */
  id: UUID;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Icon key */
  icon: WorkspaceIcon;
  /** Accent color (HSL string or theme-aware) */
  accent: string;
  /** Saved URLs/titles for one-click open */
  savedTabs: SavedTab[];
  /** Active tab IDs — persisted across sessions */
  activeTabIds: number[];
  /** Whether this is a system workspace (cannot be deleted) */
  isSystem?: boolean;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last updated timestamp */
  updatedAt: Timestamp;
}

/** A saved tab entry within a workspace */
export interface SavedTab {
  id: UUID;
  url: string;
  title: string;
  /** Favicon URL, if available */
  favicon?: string;
  /** Order index for manual sorting */
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
