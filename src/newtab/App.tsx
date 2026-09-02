import React, { useEffect, useState, useCallback } from 'react';
import { Clock } from '@/components/clock/Clock';
import { Greeting } from '@/components/clock/Greeting';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickLinks } from '@/components/shortcuts/QuickLinks';
import { RecentList } from '@/components/recent/RecentList';
import { SavedList } from '@/components/recent/SavedList';
import { WorkspaceSelector } from '@/components/workspaces/WorkspaceSelector';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useSettings, useInitializeSettings } from '@/hooks/useSettings';
import { useFocusMode } from '@/hooks/useFocusMode';
import { Icon } from '@/components/common/Icon';
import { detectIntent, buildSearchUrl } from '@/utils/url';

/**
 * NOVA New Tab — the beautiful dashboard.
 *
 * Layout:
 *   - Top-right: Theme toggle + focus mode toggle
 *   - Center: Clock + greeting
 *   - Center: Universal search bar
 *   - Below: Quick links grid
 *   - Bottom: Recent + saved sections
 *
 * When Focus Mode is active, only the search bar and clock are shown.
 */

// Listen for command-palette open messages from the background script
const useCommandPaletteListener = (onOpen: (initialQuery?: string) => void) => {
  useEffect(() => {
    const listener = (message: { action?: string; payload?: unknown }) => {
      if (message.action === 'open-command-palette') {
        const query = (message.payload as { query?: string })?.query;
        onOpen(query);
      }
      if (message.action === 'toggle-focus-mode') {
        onOpen(undefined);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [onOpen]);
};

const NewTabApp: React.FC = () => {
  const initialized = useInitializeSettings();
  const { settings } = useSettings();
  const { active: focusModeActive, toggle: toggleFocusMode } = useFocusMode();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteInitialQuery, setPaletteInitialQuery] = useState<string | undefined>(undefined);

  // Listen for keyboard shortcut from background
  useCommandPaletteListener(query => {
    setPaletteInitialQuery(query);
    setCommandPaletteOpen(true);
  });

  // Keyboard shortcut listener (client-side fallback for Ctrl/Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteInitialQuery(undefined);
        setCommandPaletteOpen(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setPaletteInitialQuery(undefined);
        setCommandPaletteOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (settings) {
      document.documentElement.setAttribute('data-theme', settings.theme);
      if (settings.accent) {
        document.documentElement.style.setProperty('--accent', settings.accent);
      }
      document.documentElement.setAttribute('data-density', settings.density);
    }
  }, [settings?.theme, settings?.accent, settings?.density]);

  const handleSearchSubmit = useCallback((query: string) => {
    const intent = detectIntent(query);
    if (intent.intent === 'url' && intent.url) {
      chrome.tabs.create({ url: intent.url });
    } else {
      chrome.tabs.create({ url: buildSearchUrl(query, settings?.defaultSearchEngine ?? 'google') });
    }
  }, [settings?.defaultSearchEngine]);

  if (!initialized || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="nova-spinner nova-spinner-lg mx-auto" />
          <p className="mt-4 text-sm text-[hsl(var(--text-tertiary))]">Loading NOVA...</p>
        </div>
      </div>
    );
  }

  const { newTab: nt, animations, density } = settings;

  // Determine transition classes based on settings
  const transitionClass = animations
    ? 'transition-all duration-150 ease-out'
    : 'transition-none';

  return (
    <ErrorBoundary>
      <div
        className={`
          min-h-screen
          bg-[hsl(var(--background))]
          text-[hsl(var(--text-primary))]
          ${transitionClass}
          ${focusModeActive ? 'overflow-hidden' : ''}
          font-sans
        `}
      >
        {/* Top bar: workspace selector + toggles */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3">
          <WorkspaceSelector compact />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`
                nova-btn nova-btn-ghost nova-btn-sm group transition-all
                ${focusModeActive
                  ? 'bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent-hover))]'
                  : 'opacity-60 hover:opacity-100'}
              `}
              title={focusModeActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            >
              <Icon
                name={focusModeActive ? 'eye' : 'eye-off'}
                size={14}
                className="group-hover:scale-105 transition-transform"
              />
              <span className="ml-1.5 text-xs font-medium">
                {focusModeActive ? 'Focus' : 'Focus mode'}
              </span>
            </button>
            <ThemeToggle compact />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center px-6 pt-8">
          {/* Clock + greeting — the centerpiece */}
          {nt.showClock && (
            <div className="mb-8 nova-enter-delay-50">
              <Clock size="lg" showDate={true} />
              {nt.showGreeting && <Greeting showDate={false} />}
            </div>
          )}

          {!nt.showClock && nt.showGreeting && (
            <div className="mb-8 nova-enter-delay-50">
              <Greeting showDate={true} />
            </div>
          )}

          {/* Universal search bar */}
          <div className={`w-full max-w-lg mb-10 ${focusModeActive ? 'mb-0' : ''} nova-enter-delay-100`}>
            <SearchBar
              placeholder="Search or type a URL..."
              showResults={!focusModeActive}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
        </div>

        {/* Quick links + sections (hidden in focus mode) */}
        {!focusModeActive && (
          <div className={`pb-8 ${animations ? 'nova-enter-delay-150' : ''}`}>
            {nt.showQuickLinks && (
              <div className="px-6 mb-8">
                <QuickLinks limit={8} columns={4} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6">
              {nt.showRecentPages && (
                <div className="nova-card p-4">
                  <h3 className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">
                    Continue where you left off
                  </h3>
                  <RecentList limit={6} showSectionTitle={false} />
                </div>
              )}
              {nt.showSavedPages && (
                <div className="nova-card p-4">
                  <h3 className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">
                    Saved pages
                  </h3>
                  <SavedList limit={6} showSectionTitle={false} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Focus mode exit hint */}
        {focusModeActive && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 nova-enter-delay-100">
            <button
              type="button"
              onClick={toggleFocusMode}
              className="nova-btn nova-btn-ghost nova-btn-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              <Icon name="eye" size={14} />
              <span className="ml-1.5 text-xs">Exit Focus Mode (Esc)</span>
            </button>
          </div>
        )}

        {/* Command Palette Overlay */}
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          initialQuery={paletteInitialQuery}
        />
      </div>
    </ErrorBoundary>
  );
};

export default NewTabApp;
