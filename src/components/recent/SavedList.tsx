import React from 'react';
import { Favicon } from '@/components/common/Favicon';
import { Icon } from '@/components/common/Icon';
import { useSavedPages } from '@/hooks/useSavedPages';
import { formatRelativeTime } from '@/utils/time';

interface SavedListProps {
  limit?: number;
  title?: string;
  showSectionTitle?: boolean;
}

/**
 * SavedList — shows saved pages ("Bookmarks you want to return to").
 */
export const SavedList: React.FC<SavedListProps> = ({ limit = 6, title = 'Saved pages', showSectionTitle = true }) => {
  const { savedPages, loading } = useSavedPages();

  const display = limit ? savedPages.slice(0, limit) : savedPages;

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
          <div key={i} className="h-11 bg-[hsl(var(--background-tertiary))] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!display.length) {
    return (
      <div className="nova-empty">
        <Icon name="bookmark" size={24} className="nova-empty__icon" />
        <p className="nova-empty__title">Nothing saved yet.</p>
        <button
          className="nova-btn nova-btn-secondary nova-btn-sm mt-2"
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
              if (tabs[0]?.url) {
                chrome.runtime.sendMessage({
                  action: 'save-current-page',
                  payload: { url: tabs[0].url, title: tabs[0].title, favicon: tabs[0].favIconUrl },
                });
              }
            });
          }}
        >
          <Icon name="bookmark-slash" size={14} />
          <span className="ml-1">Save current page</span>
        </button>
      </div>
    );
  }

  return (
    <div className="nova-saved-list space-y-1">
      {showSectionTitle && (
        <h3 className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {display.map(page => (
        <a
          key={page.id}
          href={page.url}
          onClick={e => {
            e.preventDefault();
            chrome.tabs.create({ url: page.url });
          }}
          className="nova-list-item"
        >
          <Favicon url={page.url} size={16} />
          <div className="flex-1 truncate">
            <div className="font-medium text-sm truncate">{page.title}</div>
            {page.note && (
              <div className="text-xs text-[hsl(var(--text-tertiary))] truncate">
                {page.note}
              </div>
            )}
          </div>
          <span className="text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap ml-2">
            {formatRelativeTime(page.createdAt)}
          </span>
        </a>
      ))}
    </div>
  );
};
