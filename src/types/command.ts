/**
 * Command system type definitions.
 * Commands are the foundation of the Command Palette and keyboard shortcuts.
 */

export type CommandCategory =
  | 'tab'
  | 'workspace'
  | 'navigation'
  | 'search'
  | 'save'
  | 'focus'
  | 'tools'
  | 'settings'
  | 'system';

export interface CommandContext {
  tabId?: number;
  windowId?: number;
  url?: string;
  query?: string;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export type CommandHandler = (ctx: CommandContext) => Promise<CommandResult> | CommandResult;

export interface Command {
  id: string;
  name: string;
  description?: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: string;
  handler: CommandHandler;
  /** Whether the command is available without a specific context */
  requiresContext?: boolean;
}
