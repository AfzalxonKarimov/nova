/**
 * NOVA Background Service Worker
 *
 * Manifest V3 service worker — handles:
 *   - Keyboard shortcut commands (Ctrl/Cmd+K, etc.)
 *   - Message routing between UI surfaces
 *   - Tab management operations
 *   - Focus mode state
 *   - Context menu registration
 */

import type { NovaMessage, MessageResponse } from '@/types/message';
import { executeCommand, getCommand } from '@/commands/registry';
import { DEFAULT_SETTINGS } from '@/services/settings';
import { STORAGE_KEYS, storage } from '@/services/storage';
import { uuid } from '@/utils/uuid';
import { createDefaultWorkspaces } from '@/services/workspaces';

/**
 * In-memory state in the service worker.
 * (Service workers are ephemeral — this is a cache, not source of truth.)
 */
let focusModeActive = false;
let currentWorkspace: string | null = null;

/**
 * Initialize the extension on install/update/first-run.
 */
async function initialize(): Promise<void> {
  try {
    // Check if this is a first install
    const meta = await storage.get<{ installedAt: number; version: string; seenWelcome: boolean }>(STORAGE_KEYS.meta);

    if (!meta) {
      // First install — set up defaults
      await setupFirstRun();
    }
  } catch (err) {
    console.error('NOVA: Initialization failed', err);
  }
}

/** Set up default data on first install */
async function setupFirstRun(): Promise<void> {
  const now = Date.now();

  try {
    // Store default settings
    const stored = await storage.get(STORAGE_KEYS.settings);
    if (!stored) {
      await storage.set(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    }

    // Store default workspaces
    const storedWs = await storage.get<any[]>(STORAGE_KEYS.workspaces);
    if (!storedWs) {
      const defaultWorkspaces = createDefaultWorkspaces();
      await storage.set(STORAGE_KEYS.workspaces, defaultWorkspaces);
      currentWorkspace = defaultWorkspaces[0]?.id ?? null;
    } else {
      currentWorkspace = storedWs[0]?.id ?? null;
    }

    // Meta info
    await storage.set(STORAGE_KEYS.meta, {
      installedAt: now,
      version: '1.0.0',
      seenWelcome: false,
      lastOpenedAt: now,
    });
  } catch (err) {
    console.error('NOVA: First-run setup failed', err);
  }
}

/**
 * Handle a message from a UI surface.
 */
async function handleMessage(message: NovaMessage, sender: chrome.runtime.MessageSender): Promise<MessageResponse> {
  try {
    switch (message.action) {
      case 'open-command-palette': {
        // Broadcast to all new tab pages to open
        await chrome.tabs.query({ url: chrome.runtime.getURL('newtab/index.html') });
        return { success: true, data: { focusModeActive, currentWorkspace } };
      }

      case 'execute-command': {
        const { id, context } = message.payload as { id: string; context?: Record<string, unknown> };
        const command = getCommand(id);
        if (!command) return { success: false, message: `Command "${id}" not found` };

        const activeTab = await getActiveTab();
        const result = await executeCommand(id, {
          tabId: activeTab?.id,
          windowId: activeTab?.windowId,
          ...(context ?? {}),
        });

        return {
          success: result.success,
          data: result.data,
          message: result.message,
        };
      }

      case 'get-active-tab': {
        const tab = await getActiveTab();
        return { success: true, data: tab };
      }

      case 'get-all-tabs': {
        const tabs = await getAllTabsSafe();
        return { success: true, data: tabs };
      }

      case 'save-current-page': {
        const tab = await getActiveTab();
        if (!tab?.url) return { success: false, message: 'No active tab' };
        return {
          success: true,
          data: { url: tab.url, title: tab.title, favicon: tab.favIconUrl },
        };
      }

      case 'toggle-focus-mode': {
        focusModeActive = !focusModeActive;
        return { success: true, data: { focusModeActive } };
      }

      case 'toggle-side-panel': {
        // Open the side panel programmatically
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
        return { success: true };
      }

      case 'navigate': {
        const { url } = message.payload as { url: string };
        if (currentWorkspace) {
          currentWorkspace = currentWorkspace; // no-op, just to ensure it's set
        }
        return { success: true };
      }

      case 'search': {
        const { query } = message.payload as { query: string };
        return { success: true, data: { query } };
      }

      case 'get-recent-tabs': {
        const tabs = await getRecentTabsSafe();
        return { success: true, data: tabs };
      }

      default:
        return { success: false, message: `Unknown action: ${(message as NovaMessage).action}` };
    }
  } catch (err) {
    console.error('NOVA: Message handler error', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  } catch {
    return undefined;
  }
}

async function getAllTabsSafe(): Promise<chrome.tabs.Tab[]> {
  try {
    return await chrome.tabs.query({});
  } catch {
    return [];
  }
}

async function getRecentTabsSafe(): Promise<chrome.tabs.Tab[]> {
  try {
    return await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    return [];
  }
}

/** Install listener */
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(setupFirstRun);

/**
 * Message listener — routes messages from UI surfaces to handlers.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message as NovaMessage, sender).then(sendResponse);
  return true; // keep the message channel open for async response
});

/**
 * Command (keyboard shortcut) listener.
 * Fired when the user uses a keyboard shortcut defined in manifest.json commands.
 */
chrome.commands.onCommand.addListener(async command => {
  try {
    switch (command) {
      case 'command-palette': {
        // Focus the search input in the NOVA new tab page if open
        const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('newtab/index.html') });
        if (tabs.length > 0) {
          await chrome.tabs.sendMessage(tabs[0].id!, { action: 'open-command-palette' });
        } else {
          // Open a new tab to the new tab page
          await chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') });
        }
        break;
      }

      case 'search-tabs': {
        const activeTab = await getActiveTab();
        await chrome.tabs.sendMessage(activeTab?.id ?? 0, { action: 'open-search-tabs' });
        break;
      }

      case 'save-page': {
        const activeTab = await getActiveTab();
        if (activeTab?.url) {
          await chrome.runtime.sendMessage({
            action: 'save-current-page',
            payload: { url: activeTab.url, title: activeTab.title, favicon: activeTab.favIconUrl },
          });
        }
        break;
      }

      case 'open-side-panel': {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
        }
        break;
      }

      default:
        // Check if it maps to a command in the registry
        const commandObj = getCommand(command);
        if (commandObj) {
          const activeTab = await getActiveTab();
          await executeCommand(command, {
            tabId: activeTab?.id,
            windowId: activeTab?.windowId,
          });
        }
    }
  } catch (err) {
    console.error('NOVA: Command handler error', err);
  }
});

/**
 * Context menu setup — right-click actions
 */
async function setupContextMenus(): Promise<void> {
  try {
    await chrome.contextMenus.removeAll();

    // Save page to NOVA
    await chrome.contextMenus.create({
      id: 'save-page',
      title: 'Save page to NOVA',
      contexts: ['page'],
    });

    // Send tab to workspace
    await chrome.contextMenus.create({
      id: 'send-to-workspace',
      title: 'Send tab to NOVA workspace',
      contexts: ['page'],
    });

    // Search selected text in NOVA
    await chrome.contextMenus.create({
      id: 'search-selection',
      title: 'Search "%s" in NOVA',
      contexts: ['selection'],
    });
  } catch (err) {
    console.warn('NOVA: Context menu setup failed', err);
  }
}

/**
 * Context menu click handler
 */
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'save-page') {
      if (tab?.url && !tab.url.startsWith('chrome://')) {
        await chrome.runtime.sendMessage({
          action: 'save-current-page',
          payload: { url: tab.url, title: tab.title, favicon: tab.favIconUrl },
        });
      }
    } else if (info.menuItemId === 'search-selection' && info.selectionText) {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true }).then(t => t[0]);
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'open-command-palette',
          payload: { query: info.selectionText },
        });
      }
    }
  } catch (err) {
    console.warn('NOVA: Context menu click error', err);
  }
});
} else {
  console.warn('NOVA: contextMenus API not available, context menus disabled');
}

// Initialize on load
initialize();
