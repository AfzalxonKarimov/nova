import React from 'react';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/components/common/Icon';
import type { SearchResult } from '@/services/search';
import { Favicon } from '@/components/common/Favicon';

interface SearchResultsProps {
  results: SearchResult[];
  highlightedIdx?: number;
  onSelect: (result: SearchResult) => void;
  onHighlight: (index: number) => void;
  emptyMessage?: string;
}

const typeIcons: Record<SearchResult['type'], IconName> = {
  tab: 'tab',
  bookmark: 'bookmark',
  history: 'history',
  saved: 'bookmark-slash',
  workspace: 'folder',
  quicklink: 'link',
};

const typeLabels: Record<SearchResult['type'], string> = {
  tab: 'Open Tab',
  bookmark: 'Bookmark',
  history: 'History',
  saved: 'Saved Page',
  workspace: 'Workspace',
  quicklink: 'Quick Link',
};

/**
 * SearchResults — a Raycast/Spotlight-style result list with grouping.
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  highlightedIdx = -1,
  onSelect,
  onHighlight,
  emptyMessage = 'No results',
}) => {
  if (!results || results.length === 0) {
    return (
      <div className="nova-search-empty p-4 text-center">
        <Icon name="search" size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm text-[hsl(var(--text-tertiary))]">{emptyMessage}</p>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Allow mouse hover to update highlight
  };

  return (
    <div className="nova-search-results" onMouseMove={handleMouseMove}>
      {results.map((result, idx) => (
        <button
          key={result.id}
          type="button"
          className={`nova-list-item w-full text-left transition-colors ${
            idx === highlightedIdx
              ? 'bg-[hsl(var(--background-secondary))]'
              : ''
          }`}
          onMouseEnter={() => onHighlight(idx)}
          onClick={() => onSelect(result)}
        >
          <div
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded"
            style={{ backgroundColor: getTypeColor(result.type) }}
          >
            <Icon name={typeIcons[result.type]} size={12} />
          </div>

          <div className="flex-1 truncate">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm truncate">{result.title}</span>
              <span className="nova-badge nova-badge-neutral nova-badge-sm">
                {typeLabels[result.type]}
              </span>
            </div>
            {result.subtitle && (
              <div className="text-xs text-[hsl(var(--text-tertiary))] truncate">
                {result.subtitle}
              </div>
            )}
          </div>

          {result.favicon || result.url ? (
            <Favicon url={result.url} size={14} />
          ) : (
            <div className="w-[14px] h-[14px] flex-shrink-0" />
          )}

          {idx === highlightedIdx && (
            <kbd className="ml-2 text-xs text-[hsl(var(--text-tertiary))] bg-[hsl(var(--background-tertiary))] px-1.5 py-0.5 rounded">
              ↵
            </kbd>
          )}
        </button>
      ))}
    </div>
  );
};

function getTypeColor(type: SearchResult['type']): string {
  const colors: Record<SearchResult['type'], string> = {
    tab: 'hsl(220 80% 65%)',
    bookmark: 'hsl(45 90% 60%)',
    history: 'hsl(180 70% 55%)',
    saved: 'hsl(330 80% 60%)',
    workspace: 'hsl(140 60% 50%)',
    quicklink: 'hsl(265 80% 65%)',
  };
  return colors[type];
}
