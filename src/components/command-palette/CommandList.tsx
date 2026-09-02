import React from 'react';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/components/common/Icon';
import type { Command, CommandCategory } from '@/types/command';

interface CommandListProps {
  commands: Command[];
  groups: Record<string, Command[]>;
  highlightedIdx: number;
  onHighlight: (index: number) => void;
  onSelect: (command: Command) => void;
}

/** Category labels for grouping */
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  tab: 'Tabs',
  workspace: 'Workspaces',
  navigation: 'Navigation',
  search: 'Search',
  save: 'Save',
  focus: 'Focus',
  tools: 'Tools',
  settings: 'Settings',
  system: 'System',
};

/** Category accent colors */
const CATEGORY_COLORS: Record<CommandCategory, string> = {
  tab: 'hsl(220 80% 65%)',
  workspace: 'hsl(140 60% 50%)',
  navigation: 'hsl(265 80% 65%)',
  search: 'hsl(45 90% 60%)',
  save: 'hsl(330 80% 60%)',
  focus: 'hsl(180 70% 55%)',
  tools: 'hsl(210 80% 68%)',
  settings: 'hsl(0 0% 50%)',
  system: 'hsl(0 0% 40%)',
};

/**
 * CommandList — displays grouped command results with keyboard navigation.
 */
export const CommandList: React.FC<CommandListProps> = ({
  commands,
  groups,
  highlightedIdx,
  onHighlight,
  onSelect,
}) => {
  const isFiltered = commands.length !== getVisibleCommands(groups).length;
  const visibleCommands = isFiltered ? commands : getVisibleCommands(groups);

  if (!visibleCommands.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-[hsl(var(--text-tertiary))]">No commands found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
      {isFiltered ? (
        // Flat list when filtered
        <div role="listbox">
          {commands.map((cmd, idx) => (
            <CommandItem
              key={cmd.id}
              command={cmd}
              highlighted={idx === highlightedIdx}
              onMouseEnter={() => onHighlight(idx)}
              onClick={() => onSelect(cmd)}
            />
          ))}
        </div>
      ) : (
        // Grouped list
        <div role="listbox">
          {Object.entries(groups).map(([category, cmds]) => (
            <div key={category} className="command-group">
              <div className="px-3 py-1.5 text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider">
                {CATEGORY_LABELS[category as CommandCategory] ?? category}
              </div>
              {cmds.map((cmd, idx) => {
                const globalIdx = commands.findIndex(c => c.id === cmd.id);
                return (
                  <CommandItem
                    key={cmd.id}
                    command={cmd}
                    highlighted={globalIdx === highlightedIdx}
                    onMouseEnter={() => onHighlight(globalIdx)}
                    onClick={() => onSelect(cmd)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CommandItemProps {
  command: Command;
  highlighted: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({ command, highlighted, onMouseEnter, onClick }) => {
  const categoryColor = CATEGORY_COLORS[command.category] ?? 'hsl(0 0% 50%)';

  return (
    <button
      type="button"
      className={`
        nova-list-item w-full text-left
        ${highlighted ? 'bg-[hsl(var(--background-secondary))]' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      role="option"
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center"
        style={{ backgroundColor: `${categoryColor} / 0.15` }}
      >
        <Icon name={(command.icon ?? 'info') as IconName} size={14} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{command.name}</div>
        {command.description && (
          <div className="text-xs text-[hsl(var(--text-tertiary))]">
            {command.description}
          </div>
        )}
      </div>
      {command.shortcut && (
        <span className="ml-2 nova-kbd">{command.shortcut}</span>
      )}
    </button>
  );
};

function getVisibleCommands(groups: Record<string, Command[]>): Command[] {
  return Object.values(groups).flat();
}
