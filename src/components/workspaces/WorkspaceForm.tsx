import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/common/Icon';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { WORKSPACE_ICONS } from '@/services/workspaces';
import { ACCENT_COLORS } from '@/services/settings';

interface WorkspaceFormProps {
  onSubmit: () => void;
  onCancel?: () => void;
}

/**
 * WorkspaceForm — form for creating a new workspace.
 * Premium styling with labeled inputs, icon picker grid,
 * and accent color selector.
 */
export const WorkspaceForm: React.FC<WorkspaceFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(WORKSPACE_ICONS[0].id);
  const [selectedAccent, setSelectedAccent] = useState(ACCENT_COLORS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const { create } = useWorkspaces();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await create({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        accent: selectedAccent,
      });
      setName('');
      setDescription('');
      onSubmit();
    } catch (err) {
      console.error('NOVA: Failed to create workspace', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !submitting;

  return (
    <div className="nova-card p-4 mb-4">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Icon name="folder-plus" size={16} />
        <span>Create workspace</span>
      </h3>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
            Name
          </label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Design"
            className="nova-input mt-1 h-9"
            onKeyDown={e => {
              if (e.key === 'Enter' && canSubmit) handleSubmit();
              if (e.key === 'Escape') onCancel?.();
            }}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1">
            Description <span className="text-[hsl(var(--text-tertiary))]">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's this workspace for?"
            className="nova-input mt-1 h-9"
          />
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">
            Icon
          </label>
          <div className="flex flex-wrap gap-1">
            {WORKSPACE_ICONS.map(icon => (
              <button
                key={icon.id}
                type="button"
                onClick={() => setSelectedIcon(icon.id)}
                className={`
                  w-8 h-8 rounded flex items-center justify-center
                  text-sm transition-all
                  ${selectedIcon === icon.id
                    ? 'bg-[hsl(var(--accent))] text-white scale-110'
                    : 'bg-[hsl(var(--background-tertiary))] hover:bg-[hsl(var(--border-hover))]/50'}
                `}
                title={icon.name}
              >
                {icon.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Accent color picker */}
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">
            Accent color
          </label>
          <div className="flex flex-wrap gap-1">
            {ACCENT_COLORS.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedAccent(color.value)}
                className={`
                  w-7 h-7 rounded-full border-2 transition-all
                  ${selectedAccent === color.value
                    ? 'border-[hsl(var(--text-primary))] scale-110'
                    : 'border-[hsl(var(--border))]'}
                `}
                style={{ backgroundColor: `hsl(${color.value})` }}
                title={color.name}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(var(--border))]">
          {onCancel && (
            <button type="button" onClick={onCancel} className="nova-btn nova-btn-ghost nova-btn-sm">
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="nova-btn nova-btn-primary nova-btn-sm"
          >
            {submitting ? (
              <Icon name="loading" size={14} />
            ) : (
              <Icon name="plus" size={14} />
            )}
            <span className="ml-1">Create workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
