/**
 * NOVA Type Definitions — central barrel export
 * Re-export all domain types for clean imports: `import { Workspace } from '@/types'`
 */

// Workspace
export type { Workspace, WorkspaceIcon } from './workspace';

// SavedPage
export type { SavedPage } from './saved';

// Settings
export type {
  Settings,
  Density,
  NewTabSettingKey,
  SearchEngine,
  SearchBehavior,
} from './settings';

export type { Theme } from './theme';

// Command
export type {
  Command,
  CommandCategory,
  CommandContext,
  CommandResult,
  CommandHandler,
} from './command';

// TabGroup
export type { TabGroup } from './tab-group';

// Note
export type { Note } from './note';

// QuickLink
export type { QuickLink } from './quicklink';

// HistoryItem
export type { HistoryEntry } from './history';

// Generic utilities
export type { Nullable, DeepPartial, UUID } from './utils';
