import React from 'react';
import { Icon } from '@/components/common/Icon';
import { useWorkspaces } from '@/hooks/useWorkspaces';

interface WorkspaceSwitcherProps {
  onOpenTabs?: () => void;
}

/**
 * WorkspaceSwitcher — a compact workspace switcher for the side panel.
 * Shows workspace name, accent color dot, and saved-tab count.
 */
export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ onOpenTabs }) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaces();

  if (!workspaces.length) return null;

  return (
    <div className="space-y-1">
      {workspaces.map(ws => (
        <button
          key={ws.id}
          type="button"
          onClick={() => {
            setCurrentWorkspace(ws);
            onOpenTabs?.();
          }}
          className={`
            nova-list-item w-full
            ${currentWorkspace?.id === ws.id ? 'nova-list-item-selected' : ''}
          `}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: `hsl(${ws.accent})` }}
          />
          <span className="text-sm font-medium">{ws.name}</span>
          {ws.savedTabs.length > 0 && (
            <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">
              {ws.savedTabs.length}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
