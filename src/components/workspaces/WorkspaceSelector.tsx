import React from 'react';
import { Icon } from '@/components/common/Icon';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { createPortal } from 'react-dom';

interface WorkspaceSelectorProps {
  onSelect?: (workspaceId: string) => void;
  compact?: boolean;
}

/**
 * WorkspaceSelector — a compact dropdown to switch between workspaces.
 * Uses a portal to render the dropdown outside the parent stacking context.
 */
export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ onSelect, compact = false }) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaces();
  const [open, setOpen] = React.useState(false);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setDropdownPos(null);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setDropdownPos(null);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [open]);

  // Position the dropdown relative to the button
  React.useEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  if (!currentWorkspace) return null;

  const handleSelect = (ws: typeof currentWorkspace) => {
    setCurrentWorkspace(ws);
    onSelect?.(ws.id);
    setOpen(false);
  };

  const buttonContent = (
    <>
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: `hsl(${currentWorkspace.accent})` }}
      />
      <span className="truncate">{currentWorkspace.name}</span>
      <Icon name="chevron-down" size={14} className="ml-1 opacity-50 flex-shrink-0" />
    </>
  );

  const buttonClass = `
    nova-btn nova-btn-secondary
    ${compact ? 'nova-btn-sm' : 'nova-btn-md'}
    items-center gap-1.5
    font-medium text-sm
    transition-all duration-150
  `;

  const dropdown = open && dropdownPos ? (
    <div
      ref={dropdownRef}
      className="fixed nova-popover z-[200] py-1 shadow-xl"
      style={{
        top: dropdownPos.top + 6,
        left: dropdownPos.left,
        width: Math.max(dropdownPos.width, 240),
        maxHeight: '320px',
        overflowY: 'auto',
      }}
    >
      {workspaces.map(ws => (
        <button
          key={ws.id}
          type="button"
          onClick={() => handleSelect(ws)}
          className={`
            nova-list-item w-full text-left
            ${currentWorkspace?.id === ws.id ? 'nova-list-item-selected' : ''}
          `}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: `hsl(${ws.accent})` }}
          />
          <span className="truncate">{ws.name}</span>
          {ws.savedTabs.length > 0 && (
            <span className="ml-auto text-xs text-[hsl(var(--text-tertiary))]">
              {ws.savedTabs.length}
            </span>
          )}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={buttonClass}
      >
        {buttonContent}
      </button>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </>
  );
};
