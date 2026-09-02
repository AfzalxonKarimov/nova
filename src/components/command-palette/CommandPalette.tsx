import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { CommandList } from './CommandList';
import { Icon } from '@/components/common/Icon';
import { executeCommand, getCommands, searchCommands } from '@/commands/registry';
import type { Command } from '@/types/command';
import { setBodyScrollLock, prefersReducedMotion } from '@/utils/dom';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

/**
 * CommandPalette — the Raycast/Spotlight-style command palette.
 *
 * Opens with Ctrl/Cmd+K.
 * Searchable command list with keyboard navigation.
 *
 * Commands are defined in `@/commands/registry.ts` and can be easily extended.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animateIn, setAnimateIn] = useState(false);

  // Sync initialQuery when it changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Body scroll lock + animation when open
  useEffect(() => {
    if (open) {
      setBodyScrollLock(true);
      setTimeout(() => setAnimateIn(true), 10);
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setBodyScrollLock(false);
      setAnimateIn(false);
      setQuery(initialQuery ?? '');
      setHighlightedIdx(0);
    }
  }, [open, initialQuery]);

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? searchCommands(query.trim())
    : getCommands();

  // Group by category
  const grouped = groupCommandsByCategory(filteredCommands);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        const command = filteredCommands[Math.max(0, Math.min(highlightedIdx, filteredCommands.length - 1))];
        handleExecute(command);
      }
    } else if (e.key === 'Tab') {
      // Let Tab blur / move focus normally
    }
  };

  const handleExecute = async (command: Command) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await executeCommand(command.id, {
        tabId: tabs[0]?.id,
        windowId: tabs[0]?.windowId,
        url: tabs[0]?.url,
      });

      if (result.message) {
        console.log('NOVA: Command executed:', result.message);
      }

      onClose();
    } catch (err) {
      console.error('NOVA: Command error', err);
      onClose();
    }
  };

  if (!open) return null;

  const reducedMotion = prefersReducedMotion();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: 'hsl(var(--background) / 0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => {
        // Click outside the palette to close
        if ((e.target as HTMLElement).classList.contains('palette-backdrop')) {
          onClose();
        }
      }}
    >
      {/* Command palette container */}
      <div
        className={`
          nova-popover
          w-full max-w-lg
          overflow-hidden
          transition-all
          ${reducedMotion ? 'duration-0' : 'duration-200'}
          ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        style={{
          maxHeight: 'min(60vh, 500px)',
          boxShadow: 'var(--shadow-popover)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="p-3 border-b border-[hsl(var(--border))]">
          <div className="relative flex items-center">
            <Icon
              name="search"
              size={16}
              className="absolute left-3 text-[hsl(var(--text-tertiary))]"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or run a command..."
              className="nova-input h-10 pl-10 pr-4 text-sm"
              aria-label="Command palette"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="absolute right-3 text-xs nova-kbd">
              ↵
            </kbd>
          </div>
        </div>

        {/* Results */}
        <CommandList
          commands={filteredCommands}
          groups={grouped}
          highlightedIdx={highlightedIdx}
          onHighlight={setHighlightedIdx}
          onSelect={handleExecute}
        />
      </div>
    </div>
  );
};

/** Group commands by category for display */
function groupCommandsByCategory(commands: Command[]): Record<string, Command[]> {
  const groups: Record<string, Command[]> = {};

  commands.forEach(cmd => {
    const key = cmd.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(cmd);
  });

  return groups;
}

export type CommandPaletteRef = {
  open: () => void;
  close: () => void;
};
