import React, { useState, useCallback } from 'react';
import { Icon } from '@/components/common/Icon';
import { NoteEditor } from './NoteEditor';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onPin: (note: Note) => void;
}

/**
 * NotesPanel — lightweight notes for the Side Panel.
 * Supports creating, editing, pinning, and deleting notes.
 */
export const NotesPanel: React.FC = () => {
  const { notes, pinned, unpinned, create, update, remove, loading } = useNotes();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(async (title: string, content: string) => {
    await create({ title, content });
    setIsCreating(false);
  }, [create]);

  const handleSave = useCallback(async (id: string, title: string, content: string) => {
    await update(id, { title, content });
    setEditingNote(null);
  }, [update]);

  const handlePin = useCallback(async (note: Note) => {
    await update(note.id, { pinned: !note.pinned });
  }, [update]);

  const handleDelete = useCallback(async (note: Note) => {
    if (window.confirm('Delete this note?')) {
      await remove(note.id);
      setEditingNote(null);
    }
  }, [remove]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="nova-spinner" />
      </div>
    );
  }

  const allNotes = [...pinned, ...unpinned];

  if (allNotes.length === 0 && !isCreating && !editingNote) {
    return (
      <div className="nova-empty">
        <Icon name="file-text" size={24} className="nova-empty__icon" />
        <p className="nova-empty__title">No notes yet.</p>
        <p className="nova-empty__desc">Save thoughts and ideas here.</p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="nova-btn nova-btn-primary nova-btn-sm mt-3"
        >
          <Icon name="plus" size={14} />
          <span className="ml-1">New note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Creating / editing */}
      {isCreating && !editingNote && (
        <NoteEditor
          note={null}
          onSave={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {editingNote && (
        <NoteEditor
          note={editingNote}
          onSave={(title, content) => handleSave(editingNote.id, title, content)}
          onCancel={() => setEditingNote(null)}
          onDelete={() => handleDelete(editingNote)}
        />
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section>
          <div className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
            Pinned
          </div>
          {pinned.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNote}
              onPin={handlePin}
            />
          ))}
        </section>
      )}

      {/* Unpinned section */}
      {unpinned.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <div className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1.5">
              Notes
            </div>
          )}
          {unpinned.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNote}
              onPin={handlePin}
            />
          ))}
        </section>
      )}

      {/* Create button */}
      {!isCreating && !editingNote && (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="nova-btn nova-btn-ghost nova-btn-sm w-full"
        >
          <Icon name="plus" size={14} />
          <span className="ml-1">New note</span>
        </button>
      )}
    </div>
  );
};

/** Note card component */
const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onPin }) => {
  const preview = note.content.slice(0, 120);

  return (
    <div className="nova-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-sm truncate">
            {note.title || 'Untitled'}
          </h3>
          {preview && (
            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 line-clamp-2">
              {preview}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPin(note)}
            className="nova-btn nova-btn-ghost nova-btn-square opacity-60 hover:opacity-100"
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Icon name={note.pinned ? 'pin-filled' : 'pin'} size={12} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="nova-btn nova-btn-ghost nova-btn-square opacity-60 hover:opacity-100"
            title="Edit"
          >
            <Icon name="edit" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
