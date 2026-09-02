import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/common/Icon';

interface NoteEditorProps {
  note: { title: string; content: string } | null;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  placeholder?: string;
  placeholderContent?: string;
  autoFocus?: boolean;
}

/**
 * NoteEditor — inline editor for creating or editing a note.
 * Clean card with title input, content textarea, and action bar.
 */
export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onCancel,
  onDelete,
  placeholder = 'Note title',
  placeholderContent = 'Note content...',
  autoFocus = true,
}) => {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      titleRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onCancel();
      return;
    }
    onSave(title.trim() || '(Untitled)', content.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const canSave = title.trim().length > 0 || content.trim().length > 0;

  return (
    <div className="nova-card p-3">
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="nova-input h-8 text-sm font-medium"
        aria-label="Note title"
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholderContent}
        className="nova-input mt-2 min-h-[80px] text-sm resize-y-none"
        rows={4}
        aria-label="Note content"
      />

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[hsl(var(--border))]">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="nova-btn nova-btn-danger nova-btn-sm"
          >
            <Icon name="trash" size={12} />
            <span className="ml-1">Delete</span>
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="nova-btn nova-btn-ghost nova-btn-sm"
        >
          <Icon name="x" size={12} />
          <span className="ml-1">Cancel</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="nova-btn nova-btn-primary nova-btn-sm"
        >
          <Icon name="check" size={12} />
          <span className="ml-1">Save</span>
        </button>
      </div>
    </div>
  );
};
