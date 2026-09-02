import React from 'react';
import { Favicon } from '@/components/common/Favicon';
import { Icon } from '@/components/common/Icon';
import { useRecentTabs } from '@/hooks/useTabs';
import { formatRelativeTime } from '@/utils/time';

interface RecentListProps {
  limit?: number;
  title?: string;
  showSectionTitle?: boolean;
}

/**
 * RecentList — shows recently visited tabs ("Continue where you left off").
 * Falls back to open tabs if history permission is not available.
 */
export const RecentList: React.FC<RecentListProps> = ({ limit = 6, title = 'Continue where you left off', showSectionTitle = true }) => {
  const { recent, loading } = useRecentTabs(limit);

  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-11 bg-[hsl(var(--background-tertiary))] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!recent.length) {
    return (
      <div className="nova-empty">
        <Icon name="clock" size={24} className="nova-empty__icon" />
        <p className="nova-empty__title">No recent activity yet.</p>
      </div>
    );
  }

  return (
    <div className="nova-recent-list space-y-1">
      {showSectionTitle && (
        <h3 className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {recent.map(item => (
        <a
          key={`${item.url}-${item.lastAccessed}`}
          href={item.url}
          onClick={e => {
            e.preventDefault();
            chrome.tabs.create({ url: item.url });
          }}
          className="nova-list-item"
        >
          <Favicon url={item.url} size={16} />
          <div className="flex-1 truncate">
            <div className="font-medium text-sm truncate">{item.title || getHostname(item.url)}</div>
          </div>
          <span className="text-xs text-[hsl(var(--text-tertiary))] whitespace-nowrap ml-2">
            {formatRelativeTime(item.lastAccessed)}
          </span>
          <Icon name="external" size={12} className="ml-2 opacity-30" />
        </a>
      ))}
    </div>
  );
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}
