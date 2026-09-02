/**
 * Command Registry — the heart of NOVA's command system.
 *
 * Commands are registered here and can be invoked from the Command Palette,
 * keyboard shortcuts, the side panel, or the new tab page.
 *
 * Architecture:
 *   - Each command is a simple object with an id, name, category, and handler.
 *   - Handlers receive a CommandContext (current tab, window, etc.)
 *   - Commands are registered at startup and can be queried by category, search, etc.
 *   - Adding a new command only requires adding it to NOVA_COMMANDS below.
 */

import type { Command, CommandContext, CommandResult } from '@/types/command';
import { sanitizeUrl } from '@/utils/url';
import { buildSearchUrl } from '@/utils/url';
import { saveCurrentPage as savePage } from '@/services/saved';

/** Result of a command execution */
export function success(message?: string, data?: unknown): CommandResult {
  return { success: true, message, data };
}

export function failure(message: string): CommandResult {
  return { success: false, message };
}

// ——— Tab Commands ———

async function openNewTab(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.tabs.create({ url: 'chrome://new-tab-page/' });
  return success('New tab opened');
}

async function closeCurrentTab(ctx: CommandContext): Promise<CommandResult> {
  if (!ctx.tabId) return failure('No active tab');
  await chrome.tabs.remove(ctx.tabId);
  return success('Tab closed');
}

async function reloadCurrentTab(ctx: CommandContext): Promise<CommandResult> {
  if (!ctx.tabId) return failure('No active tab');
  await chrome.tabs.reload(ctx.tabId);
  return success('Tab reloaded');
}

async function duplicateCurrentTab(ctx: CommandContext): Promise<CommandResult> {
  if (!ctx.tabId) return failure('No active tab');
  await chrome.tabs.duplicate(ctx.tabId);
  return success('Tab duplicated');
}

async function searchTabs(_ctx: CommandContext): Promise<CommandResult> {
  // This triggers the search-tabs command (opens the search overlay or side panel)
  return success('Searching tabs...');
}

// ——— Navigation Commands ———

async function goToUrl(ctx: CommandContext): Promise<CommandResult> {
  if (!ctx.query) return failure('No URL specified');
  const url = sanitizeUrl(ctx.query);
  await chrome.tabs.update({ url });
  return success(`Navigating to ${url}`);
}

async function searchGoogle(ctx: CommandContext): Promise<CommandResult> {
  if (!ctx.query) return failure('No search query');
  await chrome.tabs.create({ url: buildSearchUrl(ctx.query, 'google') });
  return success(`Searching for "${ctx.query}"`);
}

async function openBookmarks(_ctx: CommandContext): Promise<CommandResult> {
  // Signal the new tab page or side panel to open bookmarks
  return success('Opening bookmarks...');
}

// ——— Workspace Commands ———

async function createNewWorkspace(_ctx: CommandContext): Promise<CommandResult> {
  return success('Create new workspace...');
}

async function openWorkspace(ctx: CommandContext): Promise<CommandResult> {
  return success('Select a workspace...');
}

async function switchWorkspace(ctx: CommandContext): Promise<CommandResult> {
  return success('Switching workspace...');
}

// ——— Save Commands ———

async function saveCurrentPage(_ctx: CommandContext): Promise<CommandResult> {
  // Trigger the save-page flow
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.url) return failure('No active tab to save');

  await savePage({
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl,
  });
  return success('Page saved');
}

async function openSavedPages(_ctx: CommandContext): Promise<CommandResult> {
  return success('Opening saved pages...');
}

// ——— Focus Mode Commands ———

async function toggleFocusMode(_ctx: CommandContext): Promise<CommandResult> {
  return success('Toggling Focus Mode...');
}

async function enterFocusMode(_ctx: CommandContext): Promise<CommandResult> {
  return success('Entering Focus Mode...');
}

// ——— Tools Commands ———

async function openSettings(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.runtime.openOptionsPage();
  return success('Settings opened');
}

async function toggleSidePanel(_ctx: CommandContext): Promise<CommandResult> {
  // Check if side panel is already open
  return success('Toggling side panel...');
}

async function openSidePanel(_ctx: CommandContext): Promise<CommandResult> {
  return success('Opening side panel...');
}

// ——— System Commands ———

async function openExtensions(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.tabs.create({ url: 'chrome://extensions/' });
  return success('Extensions page opened');
}

async function openChromeSettings(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.tabs.create({ url: 'chrome://settings/' });
  return success('Settings opened');
}

async function openDownloads(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.tabs.create({ url: 'chrome://downloads/' });
  return success('Downloads opened');
}

async function openHistory(_ctx: CommandContext): Promise<CommandResult> {
  await chrome.tabs.create({ url: 'chrome://history/' });
  return success('History opened');
}

// ——— The Command Registry ———

export const NOVA_COMMANDS: Command[] = [
  // Tab commands
  {
    id: 'tab.new',
    name: 'New Tab',
    category: 'tab',
    icon: 'plus',
    shortcut: 'Ctrl+T',
    handler: openNewTab,
  },
  {
    id: 'tab.close',
    name: 'Close Tab',
    category: 'tab',
    icon: 'x',
    shortcut: 'Ctrl+W',
    handler: closeCurrentTab,
    requiresContext: true,
  },
  {
    id: 'tab.reload',
    name: 'Reload Tab',
    category: 'tab',
    icon: 'arrow-clockwise',
    shortcut: 'Ctrl+R',
    handler: reloadCurrentTab,
    requiresContext: true,
  },
  {
    id: 'tab.duplicate',
    name: 'Duplicate Tab',
    category: 'tab',
    icon: 'copy',
    handler: duplicateCurrentTab,
    requiresContext: true,
  },
  {
    id: 'tab.search',
    name: 'Search Tabs',
    category: 'tab',
    icon: 'search',
    shortcut: 'Ctrl+Shift+P',
    handler: searchTabs,
  },

  // Navigation commands
  {
    id: 'nav.url',
    name: 'Go to URL',
    category: 'navigation',
    icon: 'globe-alt',
    handler: goToUrl,
  },
  {
    id: 'nav.search',
    name: 'Search Google',
    category: 'navigation',
    icon: 'magnifying-glass',
    handler: searchGoogle,
  },
  {
    id: 'nav.bookmarks',
    name: 'Open Bookmarks',
    category: 'navigation',
    icon: 'bookmark',
    handler: openBookmarks,
  },

  // Workspace commands
  {
    id: 'workspace.create',
    name: 'Create New Workspace',
    category: 'workspace',
    icon: 'folder-plus',
    handler: createNewWorkspace,
  },
  {
    id: 'workspace.open',
    name: 'Open Workspace',
    category: 'workspace',
    icon: 'folder-open',
    handler: openWorkspace,
  },
  {
    id: 'workspace.switch',
    name: 'Switch Workspace',
    category: 'workspace',
    icon: 'swap',
    handler: switchWorkspace,
  },

  // Save commands
  {
    id: 'save.page',
    name: 'Save Current Page',
    category: 'save',
    icon: 'bookmark-slash',
    shortcut: 'Ctrl+Shift+S',
    handler: saveCurrentPage,
    requiresContext: true,
  },
  {
    id: 'save.open',
    name: 'Open Saved Pages',
    category: 'save',
    icon: 'bookmark',
    handler: openSavedPages,
  },

  // Focus Mode commands
  {
    id: 'focus.toggle',
    name: 'Toggle Focus Mode',
    category: 'focus',
    icon: 'eye',
    handler: toggleFocusMode,
  },
  {
    id: 'focus.enter',
    name: 'Enter Focus Mode',
    category: 'focus',
    icon: 'eye',
    handler: enterFocusMode,
  },

  // Tools commands
  {
    id: 'tools.settings',
    name: 'Settings',
    category: 'settings',
    icon: 'cog',
    handler: openSettings,
  },
  {
    id: 'tools.sidepanel',
    name: 'Toggle Side Panel',
    category: 'tools',
    icon: 'bars-3',
    shortcut: 'Ctrl+Shift+L',
    handler: toggleSidePanel,
  },
  {
    id: 'tools.open-sidepanel',
    name: 'Open Side Panel',
    category: 'tools',
    icon: 'panel-bottom-open',
    handler: openSidePanel,
  },

  // System commands
  {
    id: 'system.extensions',
    name: 'Extensions',
    category: 'system',
    icon: 'cube',
    handler: openExtensions,
  },
  {
    id: 'system.settings',
    name: 'Chrome Settings',
    category: 'system',
    icon: 'cog',
    handler: openChromeSettings,
  },
  {
    id: 'system.downloads',
    name: 'Downloads',
    category: 'system',
    icon: 'arrow-down-tray',
    handler: openDownloads,
  },
  {
    id: 'system.history',
    name: 'Browser History',
    category: 'system',
    icon: 'clock',
    handler: openHistory,
  },
];

/**
 * Get all commands (optionally filtered by category)
 */
export function getCommands(category?: string): Command[] {
  if (!category) return [...NOVA_COMMANDS];
  return NOVA_COMMANDS.filter(c => c.category === category);
}

/**
 * Search commands by name or id
 */
export function searchCommands(query: string): Command[] {
  const q = query.toLowerCase();
  return NOVA_COMMANDS.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
}

/**
 * Get a command by its ID
 */
export function getCommand(id: string): Command | undefined {
  return NOVA_COMMANDS.find(c => c.id === id);
}

/**
 * Execute a command by ID
 */
export async function executeCommand(id: string, ctx: CommandContext = {}): Promise<CommandResult> {
  const command = getCommand(id);
  if (!command) return failure(`Command "${id}" not found`);
  try {
    return await command.handler(ctx);
  } catch (err) {
    console.error('NOVA: Command execution failed', err);
    return failure(err instanceof Error ? err.message : 'Unknown error');
  }
}

/** Get command categories with counts */
export interface CommandCategoryInfo {
  id: string;
  label: string;
  count: number;
}

export function getCommandCategories(): CommandCategoryInfo[] {
  const map = new Map<string, number>();
  NOVA_COMMANDS.forEach(c => {
    map.set(c.category, (map.get(c.category) ?? 0) + 1);
  });

  return Array.from(map.entries()).map(([id, count]) => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    count,
  }));
}
