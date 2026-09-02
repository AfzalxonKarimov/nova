import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Icon } from '@/components/common/Icon';
import { useSettings, useInitializeSettings } from '@/hooks/useSettings';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useQuickLinks } from '@/hooks/useQuickLinks';
import { THEMES } from '@/types/theme';
import type { Theme } from '@/types/theme';
import type { Density, Settings } from '@/types/settings';
import { ACCENT_COLORS } from '@/services/settings';
import { WorkspaceForm } from '@/components/workspaces/WorkspaceForm';
import { QuickLinkForm } from '@/components/quicklinks/QuickLinkForm';
import { exportAllData, importAllData, clearAllData } from '@/services/export';

/**
 * NOVA Settings / Options page.
 *
 * Sections:
 *   - Appearance (theme, accent, density, animations)
 *   - New Tab (what to show)
 *   - Search
 *   - Workspaces
 *   - Quick Links
 *   - Keyboard (reference)
 *   - Data (export/import/clear)
 */

const SettingsApp: React.FC = () => {
  const initialized = useInitializeSettings();
  const { settings, update, updateNested } = useSettings();
  const { workspaces, create: createWorkspace, remove: deleteWorkspace } = useWorkspaces();
  const { links, create: createLink, remove: deleteLink } = useQuickLinks();
  const [activeSection, setActiveSection] = useState<'appearance' | 'newtab' | 'search' | 'workspaces' | 'quicklinks' | 'keyboard' | 'data'>('appearance');
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showQuickLinkForm, setShowQuickLinkForm] = useState(false);

  if (!initialized || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
        <div className="w-6 h-6 border-2 border-[hsl(var(--border))] border-t-[hsl(var(--accent))] rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'newtab', label: 'New Tab', icon: 'window' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'workspaces', label: 'Workspaces', icon: 'folder' },
    { id: 'quicklinks', label: 'Quick Links', icon: 'link' },
    { id: 'keyboard', label: 'Keyboard', icon: 'keyboard' },
    { id: 'data', label: 'Data', icon: 'database' },
  ] as const;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--text-primary))]">
        <div className="border-b border-[hsl(var(--border))]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="sparkles" size={24} />
              <h1 className="text-xl font-semibold">NOVA Settings</h1>
            </div>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Your browser, finally organized.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex gap-6">
            {/* Section navigation */}
            <nav className="w-48 flex-shrink-0">
              <ul className="space-y-1">
                {sections.map(section => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        flex items-center gap-2 w-full px-3 py-2 text-sm rounded
                        transition-colors
                        ${activeSection === section.id
                          ? 'bg-[hsl(var(--background-secondary))] text-[hsl(var(--text-primary))]'
                          : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--background-secondary))] hover:text-[hsl(var(--text-primary))]'}
                      `}
                    >
                      <Icon name={section.icon} size={14} />
                      <span>{section.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Section content */}
            <main className="flex-1">
              <ErrorBoundary>
                {activeSection === 'appearance' && renderAppearance()}
                {activeSection === 'newtab' && renderNewTab()}
                {activeSection === 'search' && renderSearch()}
                {activeSection === 'workspaces' && renderWorkspaces()}
                {activeSection === 'quicklinks' && renderQuickLinks()}
                {activeSection === 'keyboard' && renderKeyboard()}
                {activeSection === 'data' && renderData()}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );

  // ——— Section renderers ———

  function renderAppearance() {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-medium">Appearance</h2>

        {/* Theme selector */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Theme</label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => update({ theme: theme.id as Theme })}
                className={`
                  p-3 rounded border text-center
                  ${settings!.theme === theme.id
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--background-secondary))]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))]'}
                `}
              >
                <div className="w-8 h-8 mx-auto rounded bg-[hsl(var(--background-tertiary))] mb-1" />
                <div className="text-xs font-medium">{theme.name}</div>
                <div className="text-xs text-[hsl(var(--text-tertiary))]">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Accent color</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {ACCENT_COLORS.map(color => {
              const [h, s, l] = color.value.split(' ').map(v => v.replace(/%$/, ''));
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => update({ accent: color.value })}
                  className={`
                    w-8 h-8 rounded-full border-2
                    ${settings!.accent === color.value
                      ? 'border-[hsl(var(--text-primary))]'
                      : 'border-[hsl(var(--border))'}
                  `}
                  style={{ backgroundColor: `hsl(${color.value})` }}
                  title={color.name}
                  aria-label={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Density */}
        <div>
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Density</label>
          <div className="flex gap-2 mt-2">
            {(['compact', 'normal', 'comfortable'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => update({ density: d })}
                className={`
                  px-3 py-1.5 text-sm rounded
                  ${settings!.density === d
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-[hsl(var(--background-tertiary))] text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--border-hover))]/50'}
                `}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Animations toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Animations</label>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Reduce motion and transitions</p>
          </div>
          <button
            type="button"
            onClick={() => update({ animations: !settings!.animations })}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full
              ${settings!.animations ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--background-tertiary))]'}
            `}
          >
            <span className="sr-only">Toggle animations</span>
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white
                transition-transform
                ${settings!.animations ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Reduced motion follow system */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Follow system preference</label>
            <p className="text-xs text-[hsl(var(--text-tertiary))]">Respect <code>prefers-reduced-motion</code></p>
          </div>
          <button
            type="button"
            onClick={() => update({ reducedMotion: !settings!.reducedMotion })}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full
              ${settings!.reducedMotion ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--background-tertiary))]'}
            `}
          >
            <span className="sr-only">Toggle reduced motion</span>
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white
                transition-transform
                ${settings!.reducedMotion ? 'translate-x-5' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    );
  }

  function renderNewTab() {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">New Tab</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          Choose which elements to display on the NOVA new tab page.
        </p>
        <div className="space-y-3">
          {(Object.entries(settings!.newTab) as [keyof Settings['newTab'], boolean][]).map(([key, value]) => {
            const labels: Record<string, string> = {
              showClock: 'Show clock',
              showGreeting: 'Show greeting',
              showQuickLinks: 'Show quick links',
              showRecentPages: 'Show recent pages',
              showSavedPages: 'Show saved pages',
            };
            return (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm">{labels[key as string]}</label>
                <button
                  type="button"
                  onClick={() => updateNested('newTab', key, !value)}
                  className={`
                    relative inline-flex h-5 w-9 items-center rounded-full
                    ${value ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--background-tertiary))]'}
                  `}
                >
                  <span className="sr-only">Toggle</span>
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white
                      transition-transform
                      ${value ? 'translate-x-5' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSearch() {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Search</h2>

        <div>
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Default search engine</label>
          <select
            value={settings!.defaultSearchEngine}
            onChange={e => update({ defaultSearchEngine: e.target.value as any })}
            className="nova-input mt-1"
          >
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
            <option value="brave">Brave</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[hsl(var(--text-secondary))]">Search behavior</label>
          <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
            How the search bar interprets your input.
          </p>
          <div className="flex gap-2 mt-2">
            {(['autocomplete', 'search', 'both'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ searchBehavior: mode })}
                className={`
                  px-3 py-1.5 text-sm rounded
                  ${settings!.searchBehavior === mode
                    ? 'bg-[hsl(var(--accent))] text-white'
                    : 'bg-[hsl(var(--background-tertiary))] text-[hsl(var(--text-tertiary))] hover:bg-[hsl(var(--border-hover))]/50'}
                `}
              >
                {mode === 'autocomplete' ? 'Autocomplete' : mode === 'search' ? 'Search' : 'Both'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderWorkspaces() {
    const handleDelete = async (id: string) => {
      const ws = workspaces.find(w => w.id === id);
      if (ws?.isSystem) return;
      if (window.confirm(`Delete workspace "${ws?.name}"?`)) {
        await deleteWorkspace(id);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Workspaces</h2>
          <button
            type="button"
            onClick={() => setShowWorkspaceForm(!showWorkspaceForm)}
            className="nova-btn nova-btn-ghost nova-btn-sm"
          >
            <Icon name="plus" size={14} />
            <span className="ml-1">New workspace</span>
          </button>
        </div>

        {showWorkspaceForm && <WorkspaceForm onSubmit={() => setShowWorkspaceForm(false)} />}

        <div className="space-y-2">
          {workspaces.map(ws => (
            <div key={ws.id} className="nova-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `hsl(${ws.accent})` }}
                />
                <div>
                  <div className="font-medium">{ws.name}</div>
                  {ws.description && (
                    <div className="text-xs text-[hsl(var(--text-tertiary))]">{ws.description}</div>
                  )}
                </div>
              </div>
              {!ws.isSystem && (
                <button
                  type="button"
                  onClick={() => handleDelete(ws.id)}
                  className="nova-btn nova-btn-ghost nova-btn-sm"
                  title="Delete workspace"
                >
                  <Icon name="trash" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderQuickLinks() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Quick Links</h2>
          <button
            type="button"
            onClick={() => setShowQuickLinkForm(!showQuickLinkForm)}
            className="nova-btn nova-btn-ghost nova-btn-sm"
          >
            <Icon name="plus" size={14} />
            <span className="ml-1">Add link</span>
          </button>
        </div>

        {showQuickLinkForm && <QuickLinkForm onSubmit={() => setShowQuickLinkForm(false)} />}

        <div className="space-y-2">
          {links.map(link => (
            <div key={link.id} className="nova-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{link.icon ?? '🔗'}</span>
                <div>
                  <div className="font-medium">{link.name}</div>
                  <div className="text-xs text-[hsl(var(--text-tertiary))]">{link.url}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteLink(link.id)}
                className="nova-btn nova-btn-ghost nova-btn-sm"
                title="Delete link"
              >
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderKeyboard() {
    const shortcuts = [
      { keys: 'Ctrl/Cmd + K', action: 'Open Command Palette' },
      { keys: 'Ctrl/Cmd + Shift + P', action: 'Search Tabs' },
      { keys: 'Ctrl/Cmd + Shift + S', action: 'Save Current Page' },
      { keys: 'Ctrl/Cmd + Shift + L', action: 'Toggle Side Panel' },
      { keys: 'Esc', action: 'Close overlay / Exit Focus Mode' },
    ];

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Keyboard Shortcuts</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          NOVA keyboard shortcuts. These can be customized in future versions.
        </p>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.action} className="flex items-center justify-between nova-card p-3">
              <span className="text-sm">{s.action}</span>
              <kbd className="px-2 py-1 text-xs bg-[hsl(var(--background-tertiary))] rounded">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderData() {
    const handleExport = async () => {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nova-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const text = await file.text();
        const json = JSON.parse(text);
        await importAllData(json);
        window.location.reload();
      };
      input.click();
    };

    const handleClear = async () => {
      if (window.confirm('This will delete all NOVA data. Are you sure?')) {
        await clearAllData();
        window.location.reload();
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-lg font-medium">Data</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Export data</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
              Download all your NOVA data as a JSON file.
            </p>
            <button type="button" onClick={handleExport} className="nova-btn nova-btn-secondary">
              <Icon name="export" size={14} />
              <span className="ml-1">Export data</span>
            </button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Import data</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
              Restore data from a previously exported JSON file.
            </p>
            <button type="button" onClick={handleImport} className="nova-btn nova-btn-secondary">
              <Icon name="import" size={14} />
              <span className="ml-1">Import data</span>
            </button>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-[hsl(var(--text-primary))]">Clear all data</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
              Permanently delete all NOVA data. This cannot be undone.
            </p>
            <button type="button" onClick={handleClear} className="nova-btn nova-btn-secondary">
              <Icon name="trash" size={14} />
              <span className="ml-1">Clear all data</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default SettingsApp;
