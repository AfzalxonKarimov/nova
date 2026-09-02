import React, { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useQuickLinks } from '@/hooks/useQuickLinks';

interface QuickLinkFormProps {
  onSubmit: () => void;
  onCancel?: () => void;
}

/**
 * QuickLinkForm — form for adding a new quick link.
 */
export const QuickLinkForm: React.FC<QuickLinkFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const { create } = useQuickLinks();

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim()) return;
    try {
      await create({
        name: name.trim(),
        url: url.startsWith('http') ? url : `https://${url}`,
        icon: icon || undefined,
      });
      onSubmit();
    } catch (err) {
      console.error('NOVA: Failed to create quick link', err);
    }
  };

  const canSubmit = name.trim().length > 0 && url.trim().length > 0;

  return (
    <div className="nova-card p-4 mb-4">
      <h3 className="font-medium mb-3">Add quick link</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-[hsl(var(--text-secondary))]">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. GitHub"
            className="nova-input mt-1 h-9"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[hsl(var(--text-secondary))]">URL</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="nova-input mt-1 h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[hsl(var(--text-secondary))]">Icon (emoji or URL)</label>
          <input
            type="text"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            placeholder="e.g. 🐙"
            className="nova-input mt-1 h-9"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
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
            <Icon name="plus" size={14} />
            <span className="ml-1">Add link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
