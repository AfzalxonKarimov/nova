import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/components/common/Icon';
import { sanitizeUrl, detectIntent } from '@/utils/url';
import { universalSearch } from '@/services/search';
import type { SearchResult } from '@/services/search';

interface SearchBarProps {
  placeholder?: string;
  showResults?: boolean;
  onSearchSubmit?: (query: string) => void;
  compact?: boolean;
}

// Search engine URLs for URL bar navigation
const SEARCH_URLS: Record<string, (q: string) => string> = {
  google: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  bing: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  brave: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  custom: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

/**
 * NOVA Search Bar — the Spotlight/Raycast-style universal search.
 *
 * Supports:
 *   - Google search
 *   - Direct URL navigation
 *   - Open existing tabs
 *   - Bookmark search
 *   - History search
 *   - Search shortcuts (g query, y query, etc.)
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search or type a URL...',
  showResults = false,
  onSearchSubmit,
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  // Live search
  useEffect(() => {
    if (!query.trim() || !showResults) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      const { results } = await universalSearch(query);
      const limited = results.slice(0, 8);
      setResults(limited);
      setHighlightedIdx(-1);
      setIsSearching(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [query, showResults]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setResults([]);
      inputRef.current?.blur();
      return;
    }

    if (showDropdown && e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, results.length - 1));
      return;
    }

    if (showDropdown && e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, -1));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && highlightedIdx >= 0) {
        const result = results[highlightedIdx];
        handleResultClick(result);
      } else {
        handleSubmit(query);
      }
    }

    if (e.key === 'Tab') {
      if (showDropdown) {
        e.preventDefault();
        if (highlightedIdx < results.length - 1) {
          setHighlightedIdx(i => i + 1);
        } else {
          setShowDropdown(false);
          inputRef.current?.blur();
        }
      }
    }
  };

  const handleSubmit = (q: string) => {
    if (!q.trim()) return;
    setShowDropdown(false);
    onSearchSubmit?.(q);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setQuery('');
    onSearchSubmit?.(result.url ?? result.title);
  };

  return (
    <div className={`relative ${compact ? 'w-64' : 'w-full max-w-lg'}`}>
      <div className="relative">
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))]"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || query.trim()) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className={`
            nova-input pr-10
            ${compact ? 'h-9 text-sm' : 'h-11'}
            pl-10
            bg-[hsl(var(--surface))]
            border border-[hsl(var(--border))]
            focus:border-[hsl(var(--accent))]
            focus:box-shadow-md focus:box-shadow-[0_0_0_2px_hsl(var(--accent)_/_0.12)]
            placeholder:text-[hsl(var(--text-tertiary))]
          `}
          aria-label="Search or enter URL"
          autoComplete="off"
          spellCheck={false}
        />
        <div
          className={`
            absolute right-3 top-1/2 -translate-y-1/2
            transition-opacity duration-200
            ${query ? 'opacity-100' : 'opacity-40'}
          `}
        >
          {isSearching ? (
            <Icon name="loading" size={16} className="animate-spin" />
          ) : (
            <Icon name="search" size={16} />
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute top-full mt-1 w-full nova-popover overflow-hidden nova-enter"
          style={{ zIndex: 1000 }}
        >
          {isSearching && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                <Icon name="loading" size={14} className="animate-spin" />
                <span>Searching…</span>
              </div>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <ul role="listbox" className="py-1">
              {results.map((result, idx) => (
                <li
                  key={result.id}
                  className={`
                    nova-list-item cursor-pointer
                    ${idx === highlightedIdx
                      ? 'bg-[hsl(var(--background-secondary))]'
                      : ''}
                  `}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  onClick={() => handleResultClick(result)}
                  role="option"
                  aria-selected={idx === highlightedIdx}
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md"
                    style={{ backgroundColor: getTypeColor(result.type) }}
                  >
                    <Icon name={getTypeIcon(result.type)} size={12} />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-medium text-sm truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-[hsl(var(--text-tertiary))] truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  {result.favicon && (
                    <img
                      src={result.favicon}
                      alt=""
                      className="w-4 h-4 flex-shrink-0 rounded-sm"
                      loading="lazy"
                    />
                  )}
                  {idx === highlightedIdx && (
                    <span className="nova-kbd ml-2">↵</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!isSearching && results.length === 0 && (
            <div className="p-3">
              <p className="text-xs text-[hsl(var(--text-tertiary))]">
                Press Enter to search or navigate
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TYPE_COLORS: Record<string, string> = {
  tab: 'hsl(220 80% 65%)',
  bookmark: 'hsl(45 90% 60%)',
  history: 'hsl(180 70% 55%)',
  saved: 'hsl(330 80% 60%)',
  workspace: 'hsl(140 60% 50%)',
  quicklink: 'hsl(265 80% 65%)',
};

const TYPE_ICONS: Partial<Record<SearchResult['type'], IconName>> = {
  tab: 'globe',
  bookmark: 'bookmark',
  history: 'clock',
  saved: 'bookmark-slash',
  workspace: 'folder',
  quicklink: 'link',
};

function getTypeColor(type: SearchResult['type']): string {
  return TYPE_COLORS[type] ?? TYPE_COLORS.tab;
}

function getTypeIcon(type: SearchResult['type']): IconName {
  return TYPE_ICONS[type] ?? 'search';
}

// Re-export for use in the new tab page search submission
export { detectIntent };
