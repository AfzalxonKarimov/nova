import { useEffect, useState, useCallback } from 'react';
import type { Note } from '@/types/note';
import {
  loadNotes,
  createNote,
  updateNote,
  deleteNote,
  onNotesChange,
} from '@/services/notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadNotes().then(n => {
      if (mounted) {
        setNotes(n);
        setLoading(false);
      }
    });

    const unsubscribe = onNotesChange(newNotes => {
      if (mounted) {
        setNotes([...newNotes]);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const create = useCallback(async (input: { title: string; content?: string; workspaceId?: string | null }) => {
    return createNote(input);
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'pinned' | 'workspaceId'>>) => {
    return updateNote(id, patch);
  }, []);

  const remove = useCallback(async (id: string) => {
    return deleteNote(id);
  }, []);

  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  return { notes, pinned, unpinned, loading, create, update, remove };
}
