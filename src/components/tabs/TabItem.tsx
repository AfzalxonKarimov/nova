import React, { useState } from 'react';
import { Favicon } from '@/components/common/Favicon';
import { Icon } from '@/components/common/Icon';
import type { TabInfo } from '@/hooks/useTabs';

interface TabItemProps {
  tab: TabInfo;
  onRemoved?: () => void;
}

/**
 * TabItem — a single open tab with focus/close actions.
 * Clean hover state with focus ring, close button on hover.
 */
export const TabItem: React.FC<TabItemProps> = ({ tab, onRemoved }) => {
  const [hovered, setHovered] = useState(false);

  const handleFocus = () => {
    chrome.tabs.update(tab.id, { active: true }).then(() => {
      chrome.windows.update(tab.windowId, { focused: true });
    }).catch(() => {});
  };

  const handleClose = () => {
    chrome.tabs.remove(tab.id).catch(() => {});
    onRemoved?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFocus();
    }
  };

  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className="
        flex items-center gap-2 p-2 rounded-md
        hover:bg-[hsl(var(--background-secondary))]
        transition-colors
        group
        focus-within:outline-2 focus-within:outline-[hsl(var(--accent))]
        focus-within:outline-offset-1
      "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Favicon url={tab.url} size={14} />

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={handleFocus}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <div className="font-medium text-sm truncate">
          {tab.title || getDomain(tab.url)}
        </div>
        {tab.url && (
          <div className="text-xs text-[hsl(var(--text-tertiary))] truncate">
            {getDomain(tab.url)}
          </div>
        )}
      </div>

      {tab.active && (
        <span className="text-xs text-[hsl(var(--accent))] font-medium">
          active
        </span>
      )}

      {hovered && (
        <button
          type="button"
          onClick={handleClose}
          className="
            nova-btn nova-btn-ghost nova-btn-square opacity-0 group-hover:opacity-100
            transition-opacity
          "
          title="Close tab"
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
};
