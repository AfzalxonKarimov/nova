import React from 'react';
import { Icon } from '@/components/common/Icon';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useSavedPages } from '@/hooks/useSavedPages';
import { useFocusMode } from '@/hooks/useFocusMode';

/**
 * QuickActions — a set of useful one-click commands for the side panel.
 */
export const QuickActions: React.FC = () => {
  const { currentWorkspace } = useWorkspaces();
  const { savedPages } = useSavedPages();
  const { active: focusMode, toggle: toggleFocusMode } = useFocusMode();

  const actions = [
    {
      name: 'New Tab',
      icon: 'plus',
      onClick: async () => {
        await chrome.tabs.create({ url: chrome.runtime.getURL('newtab/index.html') });
      },
    },
    {
      name: 'Save Page',
      icon: 'bookmark-slash',
      onClick: async () => {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url && !tabs[0].url.startsWith('chrome://')) {
          await chrome.runtime.sendMessage({
            action: 'save-current-page',
            payload: { url: tabs[0].url, title: tabs[0].title, favicon: tabs[0].favIconUrl },
          });
        }
      },
    },
    {
      name: 'Open Workspace',
      icon: 'folder-open',
      onClick: () => {
        chrome.runtime.sendMessage({ action: 'workspace-changed', payload: { open: true } });
      },
    },
    {
      name: focusMode ? 'Exit Focus Mode' : 'Focus Mode',
      icon: focusMode ? 'eye' : 'eye-off',
      onClick: toggleFocusMode,
    },
    {
      name: 'Search Tabs',
      icon: 'search',
      onClick: () => {
        chrome.runtime.sendMessage({ action: 'open-command-palette', payload: { query: '' } });
      },
    },
    {
      name: 'Chrome Settings',
      icon: 'cog',
      onClick: async () => {
        await chrome.tabs.create({ url: 'chrome://settings/' });
      },
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="space-y-1">
        {actions.map(action => (
          <button
            key={action.name}
            type="button"
            onClick={action.onClick}
            className="nova-list-item w-full"
          >
            <Icon name={action.icon as any} size={14} />
            <span className="text-sm">{action.name}</span>
          </button>
        ))}
      </div>

      {currentWorkspace && (
        <div className="nova-card p-3">
          <div className="text-xs text-[hsl(var(--text-tertiary))]">
            Current workspace: <span className="font-medium text-[hsl(var(--text-primary))]">{currentWorkspace.name}</span>
          </div>
          <div className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
            Saved tabs: {currentWorkspace.savedTabs.length}
          </div>
          <div className="text-xs text-[hsl(var(--text-tertiary))]">
            Saved pages: {savedPages.length}
          </div>
        </div>
      )}
    </div>
  );
};
