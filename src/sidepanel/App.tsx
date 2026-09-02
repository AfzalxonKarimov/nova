import React, { useState, useEffect } from 'react';
import { WorkspaceSelector } from '@/components/workspaces/WorkspaceSelector';
import { QuickLinks } from '@/components/shortcuts/QuickLinks';
import { SavedList } from '@/components/recent/SavedList';
import { NotesPanel } from '@/components/notes/NotesPanel';
import { TabList } from '@/components/tabs/TabList';
import { QuickActions } from '@/components/workspace/QuickActions';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useSettings, useInitializeSettings } from '@/hooks/useSettings';
import { Icon } from '@/components/common/Icon';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

/**
 * NOVA Side Panel — the compact companion panel.
 *
 * Contains:
 *   - Open tabs in the current workspace
 *   - Quick links grid
 *   - Saved pages list
 *   - Notes editor/panel
 *   - Quick action commands
 */

const TABS = [
  { id: 'tabs', label: 'Tabs', icon: 'tabs' },
  { id: 'links', label: 'Links', icon: 'link' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
  { id: 'notes', label: 'Notes', icon: 'file-text' },
  { id: 'actions', label: 'Actions', icon: 'sparkles' },
] as const;

const SidePanelApp: React.FC = () => {
  const initialized = useInitializeSettings();
  const { settings } = useSettings();
  const { active: focusModeActive } = useFocusMode();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('tabs');

  if (!initialized || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-[hsl(var(--background))]">
        <div className="nova-spinner" />
      </div>
    );
  }

  // Focus Mode: collapse to a minimal view
  if (focusModeActive) {
    return (
      <div className="p-4 bg-[hsl(var(--background))] text-[hsl(var(--text-primary))] h-full">
        <div className="text-center py-8">
          <Icon name="eye" size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm text-[hsl(var(--text-tertiary))]">Focus Mode is active.</p>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
            Distractions are hidden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
        {/* Header */}
        <header className="p-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--text-tertiary))]">
                {settings.density ?? 'normal'}
              </span>
              <span className="text-xs text-[hsl(var(--text-tertiary))] opacity-40">·</span>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </span>
            </div>
            <WorkspaceSelector compact />
          </div>
        </header>

        {/* Tab navigation */}
        <nav className="flex border-b border-[hsl(var(--border))] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex flex-col items-center py-2.5 text-xs
                border-b-2 transition-all duration-150
                ${activeTab === tab.id
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--text-primary))]'
                  : 'border-transparent text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'}
              `}
            >
              <Icon
                name={tab.icon}
                size={16}
                className={`
                  mb-0.5 transition-colors
                  ${activeTab === tab.id ? 'text-[hsl(var(--accent))]' : ''}
                `}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3">
          {activeTab === 'tabs' && <TabList />}
          {activeTab === 'links' && (
            <QuickLinks limit={20} columns={4} />
          )}
          {activeTab === 'saved' && <SavedList limit={50} />}
          {activeTab === 'notes' && <NotesPanel />}
          {activeTab === 'actions' && <QuickActions />}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default SidePanelApp;
